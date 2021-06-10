<script lang="ts">
  import { Button, ButtonGroup } from 'sveltestrap';
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";
  import ConsentRequestsListContent from './ConsentRequestsListContent.svelte';

  export let storageData: Writable<StorageData>;

  let zeroRequests: boolean;
  $: zeroRequests = $storageData.consentRequestsList.length === 0;

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

<section class="container clearfix">
  <ButtonGroup class="float-end ms-2 mt-2 mb-1">
    <Button on:click={rejectAll} disabled={zeroRequests} outline size="sm" color="primary" class="flex-grow-0">Reject all</Button>
    <Button on:click={acceptAll} disabled={zeroRequests} outline size="sm" color="primary" class="flex-grow-0">Accept all</Button>
  </ButtonGroup>
  <slot/>
</section>
<section bind:this={listElement} class="container flex-grow-1 d-flex flex-column">
  <div style="height: 200px; overflow-y: auto;" tabindex={0} class="border-top border-bottom flex-grow-1">
    <ConsentRequestsListContent storageData={storageData} />
  </div>
</section>
