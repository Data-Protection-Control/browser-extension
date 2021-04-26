<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { ConsentRequestsList, ConsentResponses } from "../types";

  export let consentRequestsList: Writable<ConsentRequestsList>;
  export let consentResponses: Writable<ConsentResponses>;

  let thisElement: Element;

  const acceptAll = () => {
    const checkboxes = [...thisElement.querySelectorAll('input[type=checkbox]')];
    checkboxes.forEach((element: HTMLInputElement) => {
      if (!element.checked) element.click();
    })
    // close();
  };

  const rejectAll = () => {
    const checkboxes = [...thisElement.querySelectorAll('input[type=checkbox]')];
    checkboxes.forEach((element: HTMLInputElement) => {
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
      {#each Object.entries($consentRequestsList) as [requestId, requestText] (requestId)}
        <li class="p-4" title={requestId}>
          <label style="display: block;">
            <input
              type="checkbox"
              style="transform: scale(1.5); margin-right: 0.2em;"
              bind:checked={$consentResponses[requestId]}
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
