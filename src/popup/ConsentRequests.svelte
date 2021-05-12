<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";

  export let storageData: Writable<StorageData>;

  let thisElement: Element;

  function getAllCheckboxes(): HTMLInputElement[] {
    const checkboxes = [...thisElement.querySelectorAll('input[type=checkbox]')];
    return checkboxes as HTMLInputElement[];
  }

  const acceptAll = () => {
    getAllCheckboxes().forEach((element: HTMLInputElement) => {
      if (!element.checked) element.click();
    })
    // close();
  };

  const rejectAll = () => {
    getAllCheckboxes().forEach((element: HTMLInputElement) => {
      if (element.checked) element.click();
    })
    // close();
  };

  const close = () => {
    window.close();
  };
</script>

<style>
  li:nth-child(2n) {
    background: snow;
  }
  li:nth-child(2n+1) {
    background: whitesmoke;
  }
</style>

<div bind:this={thisElement}>
  <section class="p-2">
    <p>This website asks your consent to process your personal data for the following purposes:</p>
  </section>
  <section style="max-height: 60em; overflow-y: auto;">
    <ul>
      {#each Object.entries($storageData.consentRequestsList) as [requestId, requestText] (requestId)}
        <li class="p-4" title={requestId}>
          <label style="display: block;">
            <input
              type="checkbox"
              style="transform: scale(1.5); margin-right: 0.2em;"
              bind:checked={$storageData.consentResponses[requestId]}
            />
            <q>{requestText}</q>
          </label>
        </li>
      {/each}
    </ul>
  </section>
  <section class="p-2">
    <div class="text-center">
      <button class="m-2 px-4 py-1 bg-blue-500 text-white" on:click={acceptAll}>Accept all</button>
      <button class="m-2 px-4 py-1 bg-blue-500 text-white" on:click={rejectAll}>Reject all</button>
    </div>
    <div class="text-center">
      <button class="m-2 px-4 py-1 bg-blue-500 text-white" on:click={close}>Close</button>
    </div>
  </section>
  <section class="p-2">
    <p>You can change your responses at any time by opening this box again.</p>
  </section>
</div>
