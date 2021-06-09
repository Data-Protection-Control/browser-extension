// @ts-ignore
import iconNewRequests from '../icon/red-16.png';
// @ts-ignore
import iconKnownRequests from '../icon/darkred-16.png';
// @ts-ignore
import iconNoRequests from '../icon/grey-16.png';

// @ts-ignore
import { remoteFunction } from 'webextension-rpc';
import {
  setConsentRequestsList,
  hasUnansweredConsentRequests,
  getConsentRequestsList,
  listenToStorageChanges,
  clearConsentRequestsList,
} from '../common/consent-request-management';
import type { ConsentRequestsList } from '../types';

export async function requestConsent({
  consentRequestsList,
  tabId,
  pageUrl
}: {
  consentRequestsList: ConsentRequestsList,
  pageUrl: string,
  tabId: number,
}) {
  const webPageOrigin = new URL(pageUrl).origin;
  await setConsentRequestsList(webPageOrigin, consentRequestsList);

  await updatePageActionButton(tabId, webPageOrigin);

  if (await hasUnansweredConsentRequests(webPageOrigin)) {
    await showPopin(tabId);
  }
}

export async function pageDoesNotRequestConsent(tabId: number, pageUrl: string) {
  const webPageOrigin = new URL(pageUrl).origin;
  await clearConsentRequestsList(pageUrl);
  await updatePageActionButton(tabId, webPageOrigin);
}

export async function updatePageActionButton(tabId: number, webPageOrigin: string) {
  const consentRequestsList = await getConsentRequestsList(webPageOrigin);

  // No requests
  if (consentRequestsList.length === 0) {
    await setButtonNoRequests(tabId);
    return;
  }

  // New requests
  if (await hasUnansweredConsentRequests(webPageOrigin)) {
    await setButtonNewRequests(tabId);
    return;
  }

  // Known requests
  await setButtonKnownRequests(tabId);
}

// When the consent requests/responses change, update the page action button of relevant tabs.
listenToStorageChanges(async (webPageOrigin) => {
  const allTabs = await browser.tabs.query({});
  for (const tab of allTabs) {
    if (tab.id && tab.url && webPageOrigin === new URL(tab.url).origin) {
      await updatePageActionButton(tab.id, webPageOrigin);
    }
  }
});

async function setButtonNewRequests(tabId: number) {
  await showPageActionButton(tabId);
  browser.pageAction.setTitle({
    tabId,
    title: "This page would like to ask your consent. Click here to answer."
  });
  await browser.pageAction.setIcon({ tabId, path: iconNewRequests });
}

async function setButtonKnownRequests(tabId: number) {
  await showPageActionButton(tabId);
  browser.pageAction.setTitle({
    tabId,
    title: "This page asked your consent before. Click here to review your answers."
  });
  await browser.pageAction.setIcon({ tabId, path: iconKnownRequests });
}

async function setButtonNoRequests(tabId: number) {
  await showPageActionButton(tabId);
  browser.pageAction.setTitle({
    tabId,
    title: "No consent is requested by this website."
  });
  await browser.pageAction.setIcon({ tabId, path: iconNoRequests });
}

async function showPageActionButton(tabId: number) {
  await browser.pageAction.show(tabId);

  // Add the tabId to the popup’s URL, so it knows which page it is talking about.
  const popupUrl = new URL(await browser.pageAction.getPopup({ tabId }));
  popupUrl.searchParams.set('tabId', `${tabId}`);
  browser.pageAction.setPopup({ popup: popupUrl.href, tabId });
}

async function showPopin(tabId: number) {
  await remoteFunction('showPopin', { tabId })();
}

export async function hidePopin(tabId: number) {
  await remoteFunction('hidePopin', { tabId })();
}
