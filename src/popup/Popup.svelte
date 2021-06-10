<script lang="ts">
  import { Button } from 'sveltestrap';
  import ConsentRequestsLoader from "./ConsentRequestsLoader.svelte";
  import ConsentRequests from "./ConsentRequests.svelte";

  export let close: () => void;
  export let webPageOrigin: string | undefined;

  function openOptionsPage() {
    // browser.runtime.openOptionsPage();
    const optionsPageUrl = browser.runtime.getURL('/options/index.html');
    window.open(optionsPageUrl);
  }
</script>

<main class="mt-2 mb-2">
  <button id="close" class="btn-close small mx-2 mb-2 float-end" aria-label="Close" on:click={close}></button>
  {#if webPageOrigin}
    <ConsentRequestsLoader webPageOrigin={webPageOrigin} let:storageData>
      <ConsentRequests {storageData}/>
    </ConsentRequestsLoader>
  {:else}
    <i>This page cannot request consent.</i>
  {/if}
  <section class="container">
    <Button id="options" on:click={openOptionsPage}>Data protection control centre…</Button>
  </section>
</main>
