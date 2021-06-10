<script lang="ts">
  import ConsentRequestsLoader from "./ConsentRequestsLoader.svelte";

  export let close: () => void;
  export let webPageOrigin: string | undefined;
</script>

<main class="mt-2 mb-2">
  <button id="close" class="btn-close small mx-2 mb-2 float-end" aria-label="Close" on:click={close}></button>
  {#if webPageOrigin}
    <ConsentRequestsLoader webPageOrigin={webPageOrigin} />
  {:else}
    <i>This page cannot request consent.</i>
  {/if}
</main>
