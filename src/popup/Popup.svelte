<script lang="ts">
  import { Button } from 'sveltestrap';
  import { getDomain } from 'tldts';
  import ConsentRequestsLoader from "./ConsentRequestsLoader.svelte";
  import ConsentRequestsList from "./ConsentRequestsList.svelte";

  export let close: () => void;
  export let webPageOrigin: string | undefined;

  function openOptionsPage() {
    // browser.runtime.openOptionsPage();
    const optionsPageUrl = browser.runtime.getURL('/options/index.html');
    window.open(optionsPageUrl);
  }
</script>

<main class="py-2 flex-grow-1 d-flex flex-column">
  <!-- <button on:click={close} class="btn-close small mx-2 mb-2 float-end" aria-label="Close"></button> -->
  {#if webPageOrigin}
    <ConsentRequestsLoader webPageOrigin={webPageOrigin} let:storageData>
      <ConsentRequestsList {storageData}>
        <p>{getDomain(webPageOrigin ?? '') ?? 'This website'} asks your consent for the following:</p>
      </ConsentRequestsList>
    </ConsentRequestsLoader>
  {:else}
    <i>Unable to read this webpage’s address.</i>
  {/if}
  <section class="container mb-2 d-flex justify-content-between">
    <Button on:click={openOptionsPage} color="success" class="m-2">
      ⚙️ Control centre
    </Button>
    <Button on:click={close} class="m-2" color="primary">
      Confirm choices
    </Button>
  </section>
</main>
