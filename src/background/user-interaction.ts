// @ts-ignore
import iconFile from '../icon/icon.png';
// @ts-ignore
import iconDisabledFile from '../icon/disabled-16.png';
// @ts-ignore
import iconEnabledFile from '../icon/enabled-16.png';

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

  // for (const [identifier, consentString] of Object.entries(consentRequestsList)) {
  //   console.log(identifier, consentString);
  // }

  const notify = false;
  if (notify) {
    const consentTexts = consentRequestsList
      .map(request => `\n · ${request.text}`)
      .join();

    browser.notifications.create(`${tabId}`, {
      type: 'basic',
      title: 'Consent requested',
      message: `The website asks your consent:
      ${consentTexts}
      `,
      buttons: [{ title: 'Cool' }, { title: 'Whatever' }],
      iconUrl: iconFile,
    });

    // browser.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    //   console.log(`button ${buttonIndex} was clicked on notification ${notificationId}.`);
    // });
  }

  // Wait a moment before changing the button to avoid the browser overriding it again (Chromium bug?).
  await delay(100, () => enablePageActionButton(tabId));
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
