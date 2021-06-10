<script lang="ts">
  import { ListGroup, ListGroupItem } from 'sveltestrap';
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";
  import type { ConsentRequest } from '../types';

  export let storageData: Writable<StorageData>;

  function isUnanswered(consentRequest: ConsentRequest) {
    return $storageData.consentResponses[consentRequest.id] === undefined;
  }
</script>

<ListGroup>
  {#each $storageData.consentRequestsList as consentRequest (consentRequest.id)}
    <ListGroupItem
      id={consentRequest.id}
      class="consent-request-item {isUnanswered(consentRequest) ? 'bg-white' : 'bg-transparent'}"
    >
      <div class="form-check form-switch m-2 float-end" style="transform: scale(1.2);">
        <input
          class="form-check-input"
          type="checkbox"
          title={$storageData.consentResponses[consentRequest.id]
            ? 'Click to withdraw your consent'
            : 'Click to give your consent'
          }
          bind:checked={$storageData.consentResponses[consentRequest.id]}
        />
      </div>
      <q>{consentRequest.text}</q>
    </ListGroupItem>
  {/each}
</ListGroup>
