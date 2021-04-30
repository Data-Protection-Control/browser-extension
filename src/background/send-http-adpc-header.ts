import type { ConsentResponses } from "../types";

// Because browser storage is asynchronous, but (except in Firefox) we need
// the responses synchronously when adding the ADPC header, we keep a copy
// of the relevant values in memory.
let consentResponsesCache: { [key: string]: ConsentResponses } = {};

async function refreshConsentResponsesCache() {
  const completeStorageContents = await browser.storage.sync.get();
  consentResponsesCache = filterByKey(completeStorageContents, key => key.endsWith('#responses'));
}

function onStorageChanged(
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) {
  if (areaName === 'sync') {
    refreshConsentResponsesCache(); // Just do a complete refresh to avoid the risk of mistakes.
    // const responseChanges = Object.entries(changes)
    //   .filter(([key, _]) => key.endsWith('#responses'))
    //   .map(([key, storageChange]) => [key, storageChange.newValue])
    // Object.assign(consentResponsesCache, Object.fromEntries(responseChanges));
  }
  // console.log(JSON.stringify(consentResponsesCache, null, 2));
}

refreshConsentResponsesCache();
browser.storage.onChanged.addListener(onStorageChanged);

function responsesToAdpcHeaderValue(consentResponses: ConsentResponses): string {
  const requestIdentifiersGivenConsent = Object.entries(consentResponses).filter(
    ([_requestIdentifier, isGivenConsent]) => (isGivenConsent === true)
  ).map(([requestIdentifier, _isGivenConsent]) => requestIdentifier);
  const AdpcHeaderValue = `consent="${requestIdentifiersGivenConsent.join(' ')}"`;
  return AdpcHeaderValue;
}

function getAdpcHeaderValueForUrl(url: string): string {
  const origin = new URL(url).origin;
  const consentResponses = consentResponsesCache[`${origin}#responses`];
  return responsesToAdpcHeaderValue(consentResponses);
}

function onBeforeSendHeaders({
  requestHeaders,
  tabId,
  url,
}: {
  requestHeaders: browser.webRequest.HttpHeaders,
  tabId: number,
  url: string,
}): browser.webRequest.BlockingResponse {
  if (tabId <= 0) return;
  try {
    const AdpcHeaderValue = getAdpcHeaderValueForUrl(url);
    if (AdpcHeaderValue) {
      console.log('Sending ADPC header:', AdpcHeaderValue);
      requestHeaders.push({ name: 'ADPC', value: AdpcHeaderValue });
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

function filterByKey<T extends Object>(obj: T, predicate: (key: string) => boolean): Partial<T> {
  const filtered = Object.entries(obj).filter(([key, _]) => predicate(key));
  return Object.fromEntries(filtered) as Partial<T>;
}

export {}
