import { readable, writable, derived, get, Writable } from 'svelte/store';
import type { Readable } from 'svelte/store';

function debug(...messages: any[]) {
  // console.log(...messages);
}

interface BrowserStorageChanges {
  [key: string]: browser.storage.StorageChange;
}

interface BrowserStorageOnChangedUpdate {
  changes: BrowserStorageChanges;
  areaName: string;
}

type StorageAreaName = 'sync' | 'local' | 'managed';

const allStorageUpdates = readable<BrowserStorageOnChangedUpdate | undefined>(
  undefined,
  function onFirstSubscribe(set) {
    debug('root storage subscribe');
    function onChanged(
      changes: { [key: string]: browser.storage.StorageChange },
      areaName: string
    ): void {
      set({ changes, areaName });
    }

    browser.storage.onChanged.addListener(onChanged);
    return function onLastUnsubscribe() {
      debug('root storage unsubscribe');
      browser.storage.onChanged.removeListener(onChanged);
    }
  }
);

const storageUpdatesPerArea: {
  sync: Readable<BrowserStorageChanges>,
  local: Readable<BrowserStorageChanges>,
  managed: Readable<BrowserStorageChanges>,
} = {
  sync: derived(allStorageUpdates, (
    update: BrowserStorageOnChangedUpdate | undefined,
    set: (value: BrowserStorageChanges) => void,
  ) => {
    if (update?.areaName === 'sync') set(update.changes);
  }),
  local: derived(allStorageUpdates, (
    update: BrowserStorageOnChangedUpdate | undefined,
    set: (value: BrowserStorageChanges) => void,
  ) => {
    if (update?.areaName === 'local') set(update.changes);
  }),
  managed: derived(allStorageUpdates, (
    update: BrowserStorageOnChangedUpdate | undefined,
    set: (value: BrowserStorageChanges) => void,
  ) => {
    if (update?.areaName === 'managed') set(update.changes);
  }),
};

// A writable svelte store that synchronises with an entry in the web extension’s storage.
export function storageEntry<T>(
  storageArea: StorageAreaName,
  key: string,
  initial: T | undefined = undefined,
  cast?: (storedValue: any) => T,
): Writable<T | undefined> {
  debug('init', key, initial);
  const browserStorage = browser.storage[storageArea];

  const innerStore = writable<T | undefined>(undefined, function onFirstSubscribe(set) {
    debug('subscribe', storageArea, key);
    // Make our store update whenever the storage updates.
    const storageAreaUpdates = storageUpdatesPerArea[storageArea];
    const unsubscribeFromUpdates = storageAreaUpdates.subscribe(
      (storageUpdates: BrowserStorageChanges) => {
        if (storageUpdates && key in storageUpdates) set(storageUpdates[key].newValue);
      }
    );

    // Get/set the initial value asap.
    browserStorage.get(key).then(result => {
      debug('get', key, result);
      const storedValue = result[key] as unknown;
      const value: T = cast ? cast(storedValue) : storedValue as T;
      if (value !== undefined) {
        set(value);
      } else if (initial !== undefined) {
        store.set(initial);
      }
    });

    // If we have no subscribers left, unsubscribe from the storage area updates.
    return unsubscribeFromUpdates;
  });

  const store: Writable<T | undefined> = {
    subscribe: innerStore.subscribe,
    set(value: T) {
      debug('set', key, value);
      // Set both in the browser storage (async) and store (sync).
      // We opportunistically set the value in this svelte store as `set` must synchronously notify all subscribers. <https://svelte.dev/docs#Store_contract>
      // XXX Might cause issues due to temporary inconsistency, or permament inconsistency if storage fails.
      innerStore.set(value);
      browserStorage.set({ [key]: value })
        .catch(err => {
          console.error(`Could not persist value for '${key}': ${err.message}`)
          // Should we revert the value?
        });
    },
    update(callback) {
      const newValue = callback(get(store));
      store.set(newValue);
    },
  }
  return store;
}
