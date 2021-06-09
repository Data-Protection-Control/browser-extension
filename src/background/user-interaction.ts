// @ts-ignore
import iconNewRequests from '../icon/red-16.png';
// @ts-ignore
import iconKnownRequests from '../icon/darkred-16.png';
// @ts-ignore
import iconNoRequests from '../icon/grey-16.png';

// @ts-ignore
import { makeRemotelyCallable, remoteFunction } from 'webextension-rpc';
import { setConsentRequestsList, hasUnansweredConsentRequests } from '../common/consent-request-management';
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

  // No requests
  if (consentRequestsList.length === 0) {
    await noConsentRequested(tabId);
    return;
  }

  if (await hasUnansweredConsentRequests(webPageOrigin)) {
    // New requests
    await setButtonNewRequests(tabId);
    await showPopin(tabId);
  } else {
    // Known requests
    await setButtonKnownRequests(tabId);
  }
}

export async function noConsentRequested(tabId: number) {
  await setButtonNoRequests(tabId);
}

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

async function hidePopin(tabId: number) {
  await remoteFunction('hidePopin', { tabId })();
}

// Enable the pop-in to close itself (tabId is read from the calling tab), and
// enable the pop-up to close the pop-in (tabId is passed as parameter).
makeRemotelyCallable({
  hidePopin: async ({ tab }: { tab: browser.tabs.Tab }, tabId: number) => {
    await hidePopin(tabId ?? tab.id as number);
  },
}, { insertExtraArg: true });
