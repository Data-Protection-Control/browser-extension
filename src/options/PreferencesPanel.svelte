<script lang="ts">
  import type { Writable } from "svelte/store";
  import { ListGroup, ListGroupItem } from "sveltestrap";
  import type { UserPreferences } from "../common/user-preferences";

  export let userPreferences: Writable<UserPreferences>;
</script>

<style>
  input[type=number] {
    width: 4em;
    text-align: center;
  }
</style>

<ListGroup>
  <!-- <div class="form-check form-switch" style="transform: scale(1.2);">
    <input
      class="form-check-input"
      type="checkbox"
      bind:checked={enableInterruptOnly}
    />
  </div> -->
  <ListGroupItem>
    <label>
      Show a pop-up after you visited a website
      <input
        type="number"
        min="1"
        placeholder="1"
        list="interruptOnlyAfterNVisits-suggestions"
        bind:value={$userPreferences.interruptOnlyAfterNVisits}
      >
      <datalist>
        <option value="1"/>
        <option value="3"/>
        <option value="5"/>
        <option value="10"/>
      </datalist>
      time(s).
    </label>
  </ListGroupItem>
</ListGroup>
