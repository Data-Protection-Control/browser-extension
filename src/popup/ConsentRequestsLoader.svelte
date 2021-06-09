<script lang="ts">
  export let webPageOrigin: string;

  import type { Writable } from 'svelte/store';
  import type { StorageData } from '../common/consent-request-management';
  import { makeStorageData } from '../common/consent-request-management';
  import { storageEntry } from '../store';
  import ConsentRequests from './ConsentRequests.svelte';

  const maybeStorageData: Writable<StorageData | undefined> = storageEntry(
    'sync',
    `data:${webPageOrigin}`,
    makeStorageData(),
    data => makeStorageData(data),
  );

  const storageData = maybeStorageData as Writable<StorageData>;
</script>

{#if $maybeStorageData && $storageData.consentRequestsList.length > 0}
  <ConsentRequests {...{storageData}} />
{:else}
  <section class="p-2">
    <p>
      This page does not include any requests for consent for personal data processing.
    </p>
  </section>
{/if}
