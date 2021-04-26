// @ts-ignore
import iconFile from '../icon/icon.png';
// @ts-ignore
import iconDisabledFile from '../icon/disabled-16.png';
// @ts-ignore
import iconEnabledFile from '../icon/enabled-16.png';
import type { ConsentRequestsList, ConsentRequestsResource } from '../types';

async function updateConsentRequestsObject(webPageOrigin: string, consentRequestsList: ConsentRequestsList) {
  await browser.storage.sync.set({
    [`${webPageOrigin}#requests`]: consentRequestsList,
  });
}

async function handlePageWithConsentRequestsResource({ resourceUrl, pageUrl, tabId }: { resourceUrl: string, pageUrl: string, tabId: number }) {
  const response = await fetch(resourceUrl);
  const json = await response.text();
  const resourceObj = JSON.parse(json) as ConsentRequestsResource;
  const consentRequestsList = resourceObj.consentRequests;

  const webPageOrigin = new URL(pageUrl).origin;
  await updateConsentRequestsObject(webPageOrigin, consentRequestsList);

  // for (const [identifier, consentString] of Object.entries(consentRequestsList)) {
  //   console.log(identifier, consentString);
  // }

  const notify = false;
  if (notify) {
    const consentTexts = Object.values(consentRequestsList).map(t => `\n · ${t}`).join();
    browser.notifications.create(`${tabId}`, {
      type: 'basic',
      title: 'Consent requested',
      message: `The website asks your consent:
      ${consentTexts}
      `,
      buttons: [{ title: 'Cool' }, { title: 'Whatever' }],
      iconUrl: iconFile,
    });
  }

  // Wait a moment before changing the button to avoid the browser overriding it again (Chromium bug?).
  await delay(100, () => enablePageActionButton(tabId));
}

async function enablePageActionButton(tabId: number) {
  showPageActionButton(tabId);
  browser.pageAction.setTitle({ tabId, title: "This page would like to ask your consent. Click here to answer." });
  await browser.pageAction.setIcon({ tabId, path: iconEnabledFile });
}

async function disablePageActionButton(tabId: number) {
  showPageActionButton(tabId);
  browser.pageAction.setTitle({ tabId, title: "No consent is requested by this website." });
  await browser.pageAction.setIcon({ tabId, path: iconDisabledFile });
}

async function showPageActionButton(tabId: number) {
  await browser.pageAction.show(tabId);

  // Add the tabId to the popup’s URL, so it knows which page it is talking about.
  const popupUrl = new URL(await browser.pageAction.getPopup({ tabId }));
  popupUrl.searchParams.set('tabId', `${tabId}`);
  browser.pageAction.setPopup({ popup: popupUrl.href, tabId });
}

async function processReceivedHeaders({ responseHeaders, url, tabId }) {
  // TODO follow specs properly: support multiple links in one header, context URI, base URI, etc.
  // TODO support multiple consent-requests links; check hreflang for preferred language.
  const consentRequestsLink = responseHeaders.find(header =>
    header.name.toLowerCase() === 'link' && header.value.toLowerCase().includes('rel=consent-requests')
  );
  if (consentRequestsLink) {
    const consentRequestsLinkTarget = consentRequestsLink.value.match(/<(.*)>/)[1];
    const consentRequestsResourceUrl = new URL(consentRequestsLinkTarget, url).href;
    await handlePageWithConsentRequestsResource({
      resourceUrl: consentRequestsResourceUrl,
      pageUrl: url,
      tabId,
    });
  } else {
    // Wait a moment before changing the button to avoid the browser overriding it again (Chromium bug?).
    await delay(100, () => disablePageActionButton(tabId));
  }
}

async function onWebRequestCompleted({ responseHeaders, url, tabId }) {
  if (tabId <= 0) return;
  try {
    await processReceivedHeaders({ responseHeaders, url, tabId });
  } catch (error) {
    console.error(error.message);
  }
}

browser.webRequest.onCompleted.addListener(
  // @ts-ignore
  onWebRequestCompleted,
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  },
  ['responseHeaders'],
);

function delay<T>(ms: number, callback: () => T | Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(async () => {
      try {
        const value = await callback();
        resolve(value);
      } catch (error) {
        reject(error);
      }
    }, ms);
  });
}

export {}
