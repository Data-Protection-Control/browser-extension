<script lang="ts">
  import { Button, ButtonGroup, ListGroup, ListGroupItem } from 'sveltestrap';
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";
  import type { ConsentRequest } from '../types';

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

  function isUnanswered(consentRequest: ConsentRequest) {
    return $storageData.consentResponses[consentRequest.id] === undefined;
  }
</script>

<section class="container">
  <p>This website asks your consent for the following:</p>
</section>
<section bind:this={listElement}>
  <div style="max-height: 250px; overflow-y: auto;" tabindex={0} class="border-top border-bottom">
    <ListGroup>
      {#each $storageData.consentRequestsList as consentRequest (consentRequest.id)}
        <ListGroupItem
          id={consentRequest.id}
          class="consent-request-item {isUnanswered(consentRequest) ? 'bg-white' : 'bg-transparent'}"
        >
          <div class="form-check form-switch m-1 float-end" style="transform: scale(1.2);">
            <input
            class="form-check-input"
            type="checkbox"
            bind:checked={$storageData.consentResponses[consentRequest.id]}
            />
          </div>
          <q>{consentRequest.text}</q>
        </ListGroupItem>
      {/each}
    </ListGroup>
  </div>
</section>
{#if $storageData.consentRequestsList.length > 1}
  <ButtonGroup class="d-flex justify-content-end m-1">
    <Button on:click={rejectAll} outline size="sm" color="primary" class="flex-grow-0">Reject all</Button>
    <Button on:click={acceptAll} outline size="sm" color="primary" class="flex-grow-0">Accept all</Button>
  </ButtonGroup>
{/if}
<section class="container mt-2">
  <p>You can change your responses at any time.</p>
</section>
