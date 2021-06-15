<script lang="ts">
  import { Button, ButtonGroup, ListGroup, ListGroupItem } from "sveltestrap";
  import { getDomain } from 'tldts';
  import { setAllResponsesForAllWebsites, forgetAllWebsites, getAllOrigins } from "../common/consent-request-management";
  import PreferencesPanel from './PreferencesPanel.svelte';
  import AcceptRejectAllButtons from "../popup/AcceptRejectAllButtons.svelte";
  import ConsentRequestsListContent from "../popup/ConsentRequestsListContent.svelte";
  import ConsentRequestsLoader from "../popup/ConsentRequestsLoader.svelte";
  import PreferenceLoader from "./PreferenceLoader.svelte";

  let allOriginsP = getAllOrigins();

  async function forgetAll() {
    await forgetAllWebsites();
    allOriginsP = getAllOrigins();
  }

  async function areYouSure(event: MouseEvent, callback: () => void) {
    const buttonText = (event.target as HTMLElement).textContent;
    const sure = confirm(`${buttonText}?`);
    if (sure) callback();
  }
</script>

<style>
  h2, h3 {
    margin-top: 2em;
  }
</style>

<main class="container my-4 mx-auto" style="max-width: 40em;">
  <h2 class="mb-4">Data Protection Control Centre</h2>
  <section>
    <h3>Your preferences</h3>
    <p>
      Control how the browser should act when websites request your consent.
    </p>
    <PreferenceLoader let:userPreferences>
      <PreferencesPanel {userPreferences} />
    </PreferenceLoader>
  </section>
  <section>
    <h3>All your previous decisions</h3>
    <p>
      Here you can review the consent requests, and modify your responses, for all websites you visited.
    </p>
    {#await allOriginsP}
      <i>loading…</i>
    {:then allOrigins}
      <section class="my-4 mx-2 d-flex justify-content-end">
        <ButtonGroup>
          <Button on:click={e => areYouSure(e, forgetAll)} outline color="danger">
            Delete all requests & responses
          </Button>
          <Button on:click={e => areYouSure(e, () => setAllResponsesForAllWebsites(false))} outline color="primary">
            Withdraw all consent, for all websites
          </Button>
          <Button on:click={e => areYouSure(e, () => setAllResponsesForAllWebsites(true))} outline color="primary">
            Accept all requests, for all websites
          </Button>
        </ButtonGroup>
      </section>
      <section>
        <ListGroup>
          {#each allOrigins as origin}
            <ListGroupItem class="p-4">
              <ConsentRequestsLoader webPageOrigin={origin} let:storageData>
                <div class="clearfix">
                  <AcceptRejectAllButtons {storageData} classes="float-end ms-2 mt-2 mb-1"/>
                  <b class="fs-5">{getDomain(origin)}</b>
                </div>
                <div>
                  <ConsentRequestsListContent {storageData} />
                </div>
              </ConsentRequestsLoader>
            </ListGroupItem>
          {:else}
            <ListGroupItem>
              <em>It looks like you have not yet visited any websites that support Advanced Data Protection Control.</em>
            </ListGroupItem>
          {/each}
        </ListGroup>
      </section>
    {/await}
  </section>
  <section class="mt-5 text-muted">
    <p>
      <a class="text-muted" target="_blank" href="https://www.dataprotectioncontrol.org/">
        More information about the Advanced Data Protection Control system
      </a>
    </p>
    <p>
      Please note that this software is only a basic proof-of-concept, and does not attempt to show all the possibilities of ADPC.
    </p>
  </section>
</main>
