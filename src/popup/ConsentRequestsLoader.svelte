<script lang="ts">
  export let webPageOrigin: string;

  import type { Writable } from 'svelte/store';
  import { storageEntry } from '../store';
  import type { ConsentRequestsList } from '../types';
  import ConsentRequests from './ConsentRequests.svelte';

  const consentRequestsList: Writable<ConsentRequestsList> = storageEntry('sync', `${webPageOrigin}#requests`, {});
  const consentResponses = storageEntry('sync', `${webPageOrigin}#responses`, {});

  function empty(list: ConsentRequestsList) {
    return Object.keys(list).length === 0;
  }
</script>

<main class="text-lg">
  {#if $consentRequestsList && $consentResponses && !empty($consentRequestsList) }
    <ConsentRequests {...{consentRequestsList, consentResponses}} />
  {:else}
    <p>
      This page does not include any requests for consent for personal data processing.
    </p>
  {/if}
</main>
