<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { makeUserPreferences } from '../common/user-preferences';
  import type { UserPreferences } from '../common/user-preferences';
  import { storageEntry } from '../store';

  const maybeUserPreferences: Writable<UserPreferences | undefined> = storageEntry(
    'sync',
    `userPreferences`,
    makeUserPreferences(),
    data => makeUserPreferences(data),
  );

  const userPreferences = maybeUserPreferences as Writable<UserPreferences>;
  console.log(maybeUserPreferences)
</script>

{#if $maybeUserPreferences}
  <slot {userPreferences} />
{:else}
  <i>Could not access this browser’s local storage.</i>
{/if}
