import type { ConsentRequestsList } from "../types";

export interface UserPreferences {
  interruptOnlyAfterNVisits?: number;
}

const defaultPreferences = {
  interruptOnlyAfterNVisits: undefined,
}

export function makeUserPreferences(partialData?: Partial<UserPreferences>) {
  return {
    ...defaultPreferences,
    ...partialData,
  };
}

export async function getPreferences(): Promise<UserPreferences> {
  const key = 'userPreferences';
  const storedData = (await browser.storage.sync.get(key))[key] as Partial<UserPreferences>;
  return makeUserPreferences(storedData);
}

export async function isAllowedToInterrupt(webPageOrigin: string, consentRequestsList: ConsentRequestsList): Promise<boolean> {
  const { interruptOnlyAfterNVisits = 1 } = await getPreferences();

  // Return false if we find less than N page visits to this website in our browser history.
  if (interruptOnlyAfterNVisits > 1) {
    const historyItems = await browser.history.search({ text: webPageOrigin });
    const visitedPagesWithinSite = historyItems.filter(historyItem => historyItem.url?.startsWith(webPageOrigin));
    // We only need to count visits if we visited less than N pages (assuming each page has at least one visit).
    if (visitedPagesWithinSite.length < interruptOnlyAfterNVisits) {
      let totalVisits = 0;
      for (const historyItem of visitedPagesWithinSite) {
        const visitsToThisPage = await browser.history.getVisits({ url: historyItem.url as string });
        totalVisits += visitsToThisPage.length;
        if (totalVisits > interruptOnlyAfterNVisits)
          break;
      }
      if (totalVisits < interruptOnlyAfterNVisits) return false;
    }
  }

  return true;
}
