<script lang="ts">
  import ConsentRequestsLoader from "./ConsentRequestsLoader.svelte";

  export let close: () => void;
  export let webPageOrigin: string | undefined;
</script>

<style>
  button#close {
    float: right;
    font-size: 30px;
    line-height: 15px;
    opacity: 0.5;
    border-radius: 15px;
    margin: 4px;
    padding: 4px;
  }

  button:hover, button:focus {
    background: #ccc8;
    opacity: 1;
    outline: none;
  }
</style>

<main>
  <button id="close" on:click={close}>×</button>
  {#if webPageOrigin}
    <ConsentRequestsLoader webPageOrigin={webPageOrigin} />
  {:else}
    <i>This page cannot request consent.</i>
  {/if}
</main>
