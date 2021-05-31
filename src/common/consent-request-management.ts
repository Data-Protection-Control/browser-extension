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

export async function updateConsentRequestsObject(
  webPageOrigin: string,
  consentRequestsList: ConsentRequestsList,
) {
  const data = await getStorageDataForOrigin(webPageOrigin);
  data.consentRequestsList = consentRequestsList;
  await setStorageDataForOrigin(webPageOrigin, data);
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
    const consent = Object.entries(storageData.consentResponses)
      .filter(
        ([_requestIdentifier, isGivenConsent]) => (isGivenConsent === true)
      ).map(
        ([requestIdentifier, _isGivenConsent]) => requestIdentifier
      );
    if (consent) userDecisions.consent = consent;
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
