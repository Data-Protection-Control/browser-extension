<script lang="ts">
  import { Button, ButtonGroup, ListGroup, ListGroupItem } from "sveltestrap";
  import { setAllResponsesForAllWebsites, forgetAllWebsites, getAllOrigins } from "../common/consent-request-management";
  import ConsentRequestsListContent from "../popup/ConsentRequestsListContent.svelte";
  import ConsentRequestsLoader from "../popup/ConsentRequestsLoader.svelte";

  let allOriginsP = getAllOrigins();

  async function forgetAll() {
    await forgetAllWebsites();
    allOriginsP = getAllOrigins();
  }

  async function areYouSure(event: MouseEvent, callback: () => void) {
    const buttonText = (event.target as HTMLElement).textContent;
    const sure = confirm(`${buttonText}, for all websites?`);
    if (sure) callback();
  }
</script>

<main class="container my-4 mx-auto" style="max-width: 40em;">
  <h2 class="mb-4">Data Protection Control Centre</h2>
  <h3>Your data control decisions for all websites</h3>
  <p>
    Here you can review the consent requests, and modify your responses, for all websites you visited.
  </p>
  {#await allOriginsP}
    <i>loading…</i>
  {:then allOrigins}
    <section>
      <ListGroup>
        {#each allOrigins as origin}
          <ListGroupItem>
            <h4>{origin}</h4>
            <ConsentRequestsLoader webPageOrigin={origin} let:storageData>
              <ConsentRequestsListContent {storageData}/>
            </ConsentRequestsLoader>
          </ListGroupItem>
        {:else}
          <ListGroupItem>
            <em>It looks like you have not visited any websites yet that support Advanced Data Protection Control.</em>
          </ListGroupItem>
        {/each}
      </ListGroup>
    </section>
  {/await}
  <section class="container m-2 d-flex justify-content-end">
    <ButtonGroup>
      <Button on:click={e => areYouSure(e, forgetAll)} outline color="danger">
        Forget about all requests & responses
      </Button>
      <Button on:click={e => areYouSure(e, () => setAllResponsesForAllWebsites(false))} outline color="primary">
        Withdraw all your consent
      </Button>
      <Button on:click={e => areYouSure(e, () => setAllResponsesForAllWebsites(true))} outline color="primary">
        Consent to all requests
      </Button>
    </ButtonGroup>
  </section>
  <section class="mt-5 text-muted">
    <a class="text-muted" target="_blank" href="https://dataprotectioncontrol.org/">More information about the Advanced Data Protection Control system</a>
  </section>
</main>
