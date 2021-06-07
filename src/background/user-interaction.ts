// @ts-ignore
import iconFile from '../icon/icon.png';
// @ts-ignore
import iconDisabledFile from '../icon/disabled-16.png';
// @ts-ignore
import iconEnabledFile from '../icon/enabled-16.png';

import { makeRemotelyCallable, remoteFunction } from 'webextension-rpc';
import { updateConsentRequestsObject } from '../common/consent-request-management';
import type { ConsentRequestsList } from '../types';
import { delay } from '../common/utils';

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
  await updateConsentRequestsObject(webPageOrigin, consentRequestsList);

  if (consentRequestsList.length === 0) {
    await delay(100, () => disablePageActionButton(tabId));
    return;
  }

  // Wait a moment before changing the button to avoid the browser overriding it again (Chromium bug?).
  await delay(100, () => enablePageActionButton(tabId));

  await showPopin(tabId);
}

export async function enablePageActionButton(tabId: number) {
  showPageActionButton(tabId);
  browser.pageAction.setTitle({
    tabId,
    title: "This page would like to ask your consent. Click here to answer."
  });
  await browser.pageAction.setIcon({ tabId, path: iconEnabledFile });
}

export async function disablePageActionButton(tabId: number) {
  showPageActionButton(tabId);
  browser.pageAction.setTitle({
    tabId,
    title: "No consent is requested by this website."
  });
  await browser.pageAction.setIcon({ tabId, path: iconDisabledFile });
}

async function showPageActionButton(tabId: number) {
  await browser.pageAction.show(tabId);

  // Add the tabId to the popup’s URL, so it knows which page it is talking about.
  const popupUrl = new URL(await browser.pageAction.getPopup({ tabId }));
  popupUrl.searchParams.set('tabId', `${tabId}`);
  browser.pageAction.setPopup({ popup: popupUrl.href, tabId });
}

export async function showPopin(tabId: number) {
  const showPopinRpc = remoteFunction('showPopin', { tabId });
  await showPopinRpc();
}

export async function hidePopin(tabId: number) {
  const hidePopinRpc = remoteFunction('hidePopin', { tabId });
  await hidePopinRpc();
}

// Enable the pop-in to close itself (tabId is read from the calling tab), and
// enable the pop-up to close the pop-in (tabId is passed as parameter).
makeRemotelyCallable({
  hidePopin: async ({ tab }: { tab: browser.tabs.Tab }, tabId: number) => {
    await hidePopin(tabId ?? tab.id as number);
  },
}, { insertExtraArg: true });
