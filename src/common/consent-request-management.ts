import type { ConsentRequestsList, UserDecisionsObject, ConsentResponses } from '../types';

export interface StorageData {
  consentRequestsList: ConsentRequestsList;
  consentResponses: ConsentResponses;
}

export function makeStorageData(partialData?: Partial<StorageData>): StorageData {
  const data = {
    consentRequestsList: [],
    consentResponses: {},
    ...partialData,
  };
  return data;
}

export async function getConsentRequestsList(webPageOrigin: string): Promise<ConsentRequestsList> {
  const data = await getStorageDataForOrigin(webPageOrigin);
  return data.consentRequestsList;
}

export async function setConsentRequestsList(
  webPageOrigin: string,
  consentRequestsList: ConsentRequestsList,
) {
  const data = await getStorageDataForOrigin(webPageOrigin);
  data.consentRequestsList = consentRequestsList;
  await setStorageDataForOrigin(webPageOrigin, data);
}

export async function clearConsentRequestsList(
  webPageOrigin: string,
) {
  if (await hasStorageDataForOrigin(webPageOrigin)) {
    setConsentRequestsList(webPageOrigin, []);
  }
}

export async function hasUnansweredConsentRequests(webPageOrigin: string) {
  const storageData = await getStorageDataForOrigin(webPageOrigin);
  for (const consentRequest of storageData.consentRequestsList) {
    if (storageData.consentResponses[consentRequest.id] === undefined) {
      return true;
    }
  }
  return false;
}

export async function markConsentRequestsAsAnswered(webPageOrigin: string) {
  if (!await hasStorageDataForOrigin(webPageOrigin)) return;
  const storageData = await getStorageDataForOrigin(webPageOrigin);
  for (const consentRequest of storageData.consentRequestsList) {
    if (storageData.consentResponses[consentRequest.id] === undefined) {
      storageData.consentResponses[consentRequest.id] = false;
    }
  }
  await setStorageDataForOrigin(webPageOrigin, storageData);
}

export async function setAllResponsesForWebsite(webPageOrigin: string, consent: boolean) {
  const storageData = await getStorageDataForOrigin(webPageOrigin);
  for (const consentRequest of storageData.consentRequestsList) {
      storageData.consentResponses[consentRequest.id] = consent;
  }
  await setStorageDataForOrigin(webPageOrigin, storageData);
}

export async function hasStorageDataForOrigin(webPageOrigin: string): Promise<boolean> {
  const key = `data:${webPageOrigin}`;
  const storedData = (await browser.storage.sync.get(key))[key] as Partial<StorageData> | undefined;
  return storedData !== undefined;
}

export async function getStorageDataForOrigin(webPageOrigin: string): Promise<StorageData> {
  const key = `data:${webPageOrigin}`;
  const storedData = (await browser.storage.sync.get(key))[key] as Partial<StorageData> | undefined;
  return makeStorageData(storedData);
}

async function setStorageDataForOrigin(webPageOrigin: string, data: StorageData) {
  const key = `data:${webPageOrigin}`;
  await browser.storage.sync.set({
    [key]: data,
  });
}

export async function getUserDecisions(webPageOrigin: string): Promise<UserDecisionsObject> {
  const storageData = await getStorageDataForOrigin(webPageOrigin);
  return storageDataToUserDecisions(storageData);
}

export function storageDataToUserDecisions(storageData: StorageData): UserDecisionsObject {
  const userDecisions: UserDecisionsObject = {};

  if (storageData.consentResponses) {
    // Get the identifiers of requests that were consented to, and are still applicable.
    const consent = Object.entries(storageData.consentResponses)
      .filter(
        ([requestIdentifier, isGivenConsent]) => (
          isGivenConsent === true &&
          storageData.consentRequestsList.some(
            consentRequest => consentRequest.id === requestIdentifier
          )
        )
      ).map(
        ([requestIdentifier, _isGivenConsent]) => requestIdentifier
      );
    if (consent.length > 0) userDecisions.consent = consent;
  }

  return userDecisions;
}

export function listenToStorageChanges(
  callback: (webPageOrigin: string, newValue: StorageData, oldValue: StorageData) => void,
) {
  browser.storage.onChanged.addListener(
    (changes, areaName) => {
      if (areaName !== 'sync') return;

      Object.entries(changes).forEach(([key, change]) => {
        if (!key.startsWith('data:')) return;
        const webPageOrigin = key.slice('data:'.length);
        const newStorageData = makeStorageData(change.newValue);
        const oldStorageData = makeStorageData(change.oldValue);
        callback(webPageOrigin, newStorageData, oldStorageData);
      });
    }
  );
}

export async function getAllOrigins() {
  const storageContents = await browser.storage.sync.get();
  const allOrigins = Object.keys(storageContents)
    .filter(key => key.startsWith('data:'))
    .map(key => key.slice('data:'.length));
  return allOrigins;
}

export async function setAllResponsesForAllWebsites(consent: boolean) {
  for (const origin of await getAllOrigins()) {
    await setAllResponsesForWebsite(origin, consent);
  }
}

export async function forgetAllWebsites() {
  for (const origin of await getAllOrigins()) {
    await browser.storage.sync.remove(`data:${origin}`);
  }
}
