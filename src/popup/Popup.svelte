<script lang="ts">
  import ConsentRequestsLoader from "./ConsentRequestsLoader.svelte";

  async function getWebPageOrigin() {
    const tabIdParam = new URL(document.URL).searchParams.get('tabId');
    if (!tabIdParam) {
      throw new Error("No tab specified");
    }
    const tabId = Number.parseInt(tabIdParam);
    const tab = await browser.tabs.get(tabId);
    const websiteOrigin = new URL(tab.url).origin;
    return websiteOrigin;
  }

  const webPageOriginP = getWebPageOrigin();
</script>

<main style="width: 30em;">
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
