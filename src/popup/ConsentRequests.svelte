<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { StorageData } from "../common/consent-request-management";

  export let storageData: Writable<StorageData>;

  let listElement: Element;

  function getAllCheckboxes(): HTMLInputElement[] {
    const checkboxes = [...listElement.querySelectorAll('input[type=checkbox]')];
    return checkboxes as HTMLInputElement[];
  }

  const acceptAll = () => {
    getAllCheckboxes().forEach((element: HTMLInputElement) => {
      if (!element.checked) element.click();
    })
  };

  const rejectAll = () => {
    getAllCheckboxes().forEach((element: HTMLInputElement) => {
      if (element.checked) element.click();
    })
  };
</script>

<section class="p-2">
  <p>This website asks your consent to process your personal data for the following purposes:</p>
</section>
<section style="max-height: 200px; overflow-y: auto;">
  <ul bind:this={listElement}>
    {#each $storageData.consentRequestsList as consentRequest (consentRequest.id)}
      <li class="px-4 py-2 my-1 bg-white">
        <label style="display: block;">
          <input
            type="checkbox"
            style="transform: scale(1.5); margin-right: 0.2em;"
            bind:checked={$storageData.consentResponses[consentRequest.id]}
          />
          <q>{consentRequest.text}</q>
        </label>
      </li>
    {/each}
  </ul>
</section>
<section class="p-2">
  <div class="text-center">
    <button class="m-1 px-4 py-1 bg-blue-500 text-white" on:click={acceptAll}>Accept all</button>
    <button class="m-1 px-4 py-1 bg-blue-500 text-white" on:click={rejectAll}>Reject all</button>
  </div>
</section>
<section class="p-2">
  <p>You can change your responses at any time by opening this box again.</p>
</section>
