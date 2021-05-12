import type { UserDecisionsObject } from "../types";
import { storageDataToUserDecisions, StorageData, makeStorageData } from "../common/consent-request-management";

// Because browser storage is asynchronous, but (except in Firefox) we need the
// responses synchronously when adding the ADPC header, we keep a copy in memory.
let browserExtensionStorageCache: { [key: string]: StorageData | undefined } = {};
async function refreshStorageCache() {
  browserExtensionStorageCache = await browser.storage.sync.get();
}
refreshStorageCache();
// On any database change, do a complete refresh (for simplicity).
browser.storage.onChanged.addListener(refreshStorageCache);

function userDecisionsToAdpcHeaderValues(userDecisions: UserDecisionsObject): string[] {
  const adpcHeaderValues: string[] = [];
  if (userDecisions.consent) {
    const headerValue = `consent="${userDecisions.consent.join(' ')}"`;
    adpcHeaderValues.push(headerValue);
  }
  if (userDecisions.withdraw) {
    const headerValue = `withdraw="${userDecisions.withdraw.join(' ')}"`;
    adpcHeaderValues.push(headerValue);
  }
  if (userDecisions.object) {
    const headerValue = `object="${userDecisions.object.join(' ')}"`;
    adpcHeaderValues.push(headerValue);
  }
  return adpcHeaderValues;
}

function getAdpcHeaderValueForUrl(url: string): string {
  const origin = new URL(url).origin;

  // const userDecisions = await getUserDecisions(origin);
  const key = `data:${origin}`;
  const storageData = makeStorageData(browserExtensionStorageCache[key]);
  const userDecisions = storageDataToUserDecisions(storageData);

  const headerValues = userDecisionsToAdpcHeaderValues(userDecisions);
  return headerValues.join(', ');
}

function onBeforeSendHeaders({
  requestHeaders,
  tabId,
  url,
}: {
  requestHeaders: browser.webRequest.HttpHeaders,
  tabId: number,
  url: string,
}): browser.webRequest.BlockingResponse | void {
  if (tabId <= 0) return;
  try {
    const adpcHeaderValue = getAdpcHeaderValueForUrl(url);
    if (adpcHeaderValue) {
      console.log('Sending ADPC header:', adpcHeaderValue);
      requestHeaders.push({ name: 'ADPC', value: adpcHeaderValue });
    }
    return { requestHeaders };
  } catch (error) {
    console.error(error.message);
  }
}

browser.webRequest.onBeforeSendHeaders.addListener(
  // @ts-ignore
  onBeforeSendHeaders,
  {
    urls: ['<all_urls>'],
  },
  ['blocking', 'requestHeaders'],
);

export {}
