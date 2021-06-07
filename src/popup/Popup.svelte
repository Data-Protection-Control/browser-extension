<script lang="ts">
  import ConsentRequestsLoader from "./ConsentRequestsLoader.svelte";
  export let close: () => void;

  async function getWebPageOrigin() {
    // For popin
    const searchParams = new URL(document.URL).searchParams;
    const originParam = searchParams.get('origin');
    if (originParam) return originParam;

    // For popup
    const tabIdParam = searchParams.get('tabId');
    if (!tabIdParam) {
      throw new Error("No tab specified");
    }
    const tabId = Number.parseInt(tabIdParam);
    const tab = await browser.tabs.get(tabId);
    const websiteOrigin = new URL(tab.url as string).origin;
    return websiteOrigin;
  }

  const webPageOriginP = getWebPageOrigin();

</script>

<style>
  img#icon {
    margin: 8px;
    float: left;
  }

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
  <img id="icon" src="/icon/38.png"/>
  <button id="close" on:click={close}>×</button>
  {#await webPageOriginP}
    <p>
      Reading tab URL..
    </p>
  {:then webPageOrigin}
    <ConsentRequestsLoader webPageOrigin={webPageOrigin} />
  {:catch error}
    <p>
      Error: {error.message}
    </p>
  {/await}
</main>
