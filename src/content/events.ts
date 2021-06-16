import deepEqual from 'fast-deep-equal';
import { listenToStorageChanges, storageDataToUserDecisions } from "../common/consent-request-management";
import { executePageScript, maybeClone } from "./execute-page-script";

// Dispatch ADPC events in the page script’s context.

// We make the page listen to a ‘proxy’ event on document, to then dispatch that
// at navigator.dataProtectionControl.
// TODO Make page-script-rpc work in the opposite direction too, and use that?
const randomString = Math.random().toString(36).slice(2);
const proxyEventName = `__ADPC_PROXY_EVENT__${randomString}`;

const pageScriptContent = `
  if (globalThis.window.navigator.dataProtectionControl === undefined) {
    globalThis.window.navigator.dataProtectionControl = new EventTarget();
  }

  class AdpcEvent extends Event {
    constructor(typeArg, attributes) {
      super(typeArg);
      Object.assign(this, attributes);
    }
  }

  document.addEventListener('${proxyEventName}', (proxyEvent) => {
    const adpcEvent = new AdpcEvent(
      'decisionchange',
      proxyEvent.detail,
    );
    globalThis.window.navigator.dataProtectionControl.dispatchEvent(adpcEvent);
  })
`;
executePageScript(pageScriptContent);

listenToStorageChanges((webPageOrigin, newStorageData, oldStorageData) => {
  if (webPageOrigin !== new URL(document.URL).origin) return;

  const newUserDecisions = storageDataToUserDecisions(newStorageData);
  const oldUserDecisions = storageDataToUserDecisions(oldStorageData);
  if (deepEqual(newUserDecisions, oldUserDecisions)) return;

  const eventAttributes = {
    userDecisions: newUserDecisions,
  };

  const proxyEvent = new CustomEvent(
    proxyEventName,
    maybeClone({ detail: eventAttributes }),
  );
  document.dispatchEvent(proxyEvent);
});
