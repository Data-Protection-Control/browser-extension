<script lang="ts">
  import { Button, ButtonGroup } from 'sveltestrap';
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";
  import ConsentRequestsListContent from './ConsentRequestsListContent.svelte';

  export let storageData: Writable<StorageData>;

  let listElement: Element;

  function getVisibleConsentRequests() {
    return [...listElement.querySelectorAll('.consent-request-item')];
  }

  const acceptAll = () => {
    getVisibleConsentRequests().forEach((element) => {
      $storageData.consentResponses[element.id] = true;
    });
  };

  const rejectAll = () => {
    getVisibleConsentRequests().forEach((element) => {
      $storageData.consentResponses[element.id] = false;
    });
  };
</script>

<section class="container">
  <p>This website asks your consent for the following:</p>
</section>
<section bind:this={listElement}>
  <div style="max-height: 250px; overflow-y: auto;" tabindex={0} class="border-top border-bottom">
    <ConsentRequestsListContent storageData={storageData} />
  </div>
</section>
{#if $storageData.consentRequestsList.length > 1}
  <ButtonGroup class="d-flex justify-content-end m-1">
    <Button on:click={rejectAll} outline size="sm" color="primary" class="flex-grow-0">Reject all</Button>
    <Button on:click={acceptAll} outline size="sm" color="primary" class="flex-grow-0">Accept all</Button>
  </ButtonGroup>
{/if}
