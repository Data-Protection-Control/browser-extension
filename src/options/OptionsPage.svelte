<script lang="ts">
  import { Button, ButtonGroup, ListGroup, ListGroupItem } from "sveltestrap";
  import { setAllResponsesForAllWebsites, forgetAllWebsites, getAllOrigins } from "../common/consent-request-management";
  import ConsentRequestsListContent from "../popup/ConsentRequestsListContent.svelte";
  import ConsentRequestsLoader from "../popup/ConsentRequestsLoader.svelte";

  let allOriginsP = getAllOrigins();
</script>

<main class="my-4 mx-auto" style="max-width: 40em;">
  <h1 class="mb-4">Data Protection Control Centre</h1>
  <h2>Your data control decisions for all websites</h2>
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
            <h3 class="fs-4">{origin}</h3>
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
      <Button on:click={() => setAllResponsesForAllWebsites(false)} outline color="primary">Reject all requests</Button>
      <Button on:click={() => setAllResponsesForAllWebsites(true)} outline color="primary">Accept all requests</Button>
      <Button on:click={() => forgetAllWebsites()} outline color="primary">Forget about all requests & responses</Button>
    </ButtonGroup>
  </section>
  <section class="mt-5 text-muted">
    <a class="text-muted" target="_blank" href="https://dataprotectioncontrol.org/">More information about the Advanced Data Protection Control system</a>
  </section>
</main>
