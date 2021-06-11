<script lang="ts">
  import { Button, ButtonGroup, ListGroup, ListGroupItem } from "sveltestrap";
  import { getDomain } from 'tldts';
  import { setAllResponsesForAllWebsites, forgetAllWebsites, getAllOrigins } from "../common/consent-request-management";
  import PreferencesPanel from './PreferencesPanel.svelte';
  import ConsentRequestsList from "../popup/ConsentRequestsList.svelte";
  import ConsentRequestsLoader from "../popup/ConsentRequestsLoader.svelte";
  import PreferenceLoader from "./PreferenceLoader.svelte";

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

<style>
  h3 {
    margin-top: 2em;
  }
</style>

<main class="container my-4 mx-auto" style="max-width: 40em;">
  <h2 class="mb-4">Data Protection Control Centre</h2>
  <section>
    <h3>Your preferences</h3>
    <p>
      Control how the browser should act on website’s requests for your consent.
    </p>
    <PreferenceLoader let:userPreferences>
      <PreferencesPanel {userPreferences} />
    </PreferenceLoader>
  </section>
  <section>
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
            <ListGroupItem class="p-4">
              <ConsentRequestsLoader webPageOrigin={origin} let:storageData>
                <ConsentRequestsList {storageData}>
                  <b class="fs-5">{getDomain(origin)}</b>
                </ConsentRequestsList>
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
          Consent to all these requests
        </Button>
      </ButtonGroup>
    </section>
  </section>
  <section class="mt-5 text-muted">
    <a class="text-muted" target="_blank" href="https://dataprotectioncontrol.org/">More information about the Advanced Data Protection Control system</a>
  </section>
</main>
