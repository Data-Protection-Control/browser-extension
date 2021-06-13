<script lang="ts">
  export let webPageOrigin: string;

  import type { Writable } from 'svelte/store';
  import type { StorageData } from '../common/consent-request-management';
  import { makeStorageData } from '../common/consent-request-management';
  import { storageEntry } from '../common/svelte-browser-storage';

  const maybeStorageData: Writable<StorageData | undefined> = storageEntry(
    'sync',
    `data:${webPageOrigin}`,
    makeStorageData(),
    data => makeStorageData(data),
  );

  const storageData = maybeStorageData as Writable<StorageData>;
</script>

{#if $maybeStorageData}
  <slot {storageData} />
{:else}
  <i>Could not access this browser’s local storage.</i>
{/if}
