<script lang="ts">
  export let webPageOrigin: string;

  import type { Writable } from 'svelte/store';
  import type { StorageData } from '../common/consent-request-management';
  import { makeStorageData } from '../common/consent-request-management';
  import { storageEntry } from '../store';
  import type { ConsentRequestsList } from '../types';
  import ConsentRequests from './ConsentRequests.svelte';

  const maybeStorageData: Writable<StorageData | undefined> = storageEntry(
    'sync',
    `data:${webPageOrigin}`,
    makeStorageData(),
    data => makeStorageData(data),
  );

  const storageData = maybeStorageData as Writable<StorageData>;

  function empty(list: ConsentRequestsList) {
    return Object.keys(list).length === 0;
  }
</script>

<main class="text-lg">
  {#if $maybeStorageData && !empty($storageData.consentRequestsList)}
    <ConsentRequests {...{storageData}} />
  {:else}
    <p>
      This page does not include any requests for consent for personal data processing.
    </p>
  {/if}
</main>
