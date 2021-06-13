<script lang="ts">
  import { Button, ButtonGroup } from 'sveltestrap';
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";

  export let storageData: Writable<StorageData>;
  export let classes: string | undefined = undefined;

  let zeroRequests: boolean;
  $: zeroRequests = $storageData.consentRequestsList.length === 0;

  const respondAll = (consent: boolean) => {
    $storageData.consentRequestsList.forEach(({ id }) => {
      $storageData.consentResponses[id] = consent;
    });
  };

</script>

<ButtonGroup class={classes}>
  <Button on:click={() => respondAll(false)} disabled={zeroRequests} outline size="sm" color="primary" class="flex-grow-0">Reject all</Button>
  <Button on:click={() => respondAll(true)} disabled={zeroRequests} outline size="sm" color="primary" class="flex-grow-0">Accept all</Button>
</ButtonGroup>
