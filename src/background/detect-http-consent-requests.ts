import type { ConsentRequestsResource, ConsentRequestsList } from '../types';
import { requestConsent, pageDoesNotRequestConsent } from './user-interaction';
import { validateConsentRequestsResource } from '../common/type-validation';
import { delay } from '../common/utils';

type OnWebRequestCompletedDetails =
  & browser.webRequest._OnCompletedDetails
  & { responseHeaders: browser.webRequest.HttpHeaders };

async function getConsentRequestsResource(resourceUrl: string): Promise<ConsentRequestsResource> {
  const response = await fetch(resourceUrl);
  const json = await response.text();
  const resourceObj = JSON.parse(json) as ConsentRequestsResource;
  validateConsentRequestsResource(resourceObj);
  return resourceObj;
}

async function processReceivedHeaders({ responseHeaders, url, tabId }:
  Pick<OnWebRequestCompletedDetails, 'responseHeaders' | 'url' | 'tabId'>
) {
  // Give things a moment to be properly loaded before calling UI functions:
  // - to avoid the browser overriding the page action button.
  // - to ensure the content script is ready for RPCs.
  // Hopefully 100ms will always suffice..
  const stuffShouldHaveLoadedByNow = delay(100);

  // By default, a page does not ask for consent.
  let consentRequestsList: ConsentRequestsList | undefined;

  // TODO follow specs properly: support multiple links in one header, context URI, base URI, etc.
  // TODO support multiple consent-requests links; check hreflang for preferred language.
  const consentRequestsLink = responseHeaders.find(header =>
    header.name.toLowerCase() === 'link'
    && header.value?.toLowerCase().includes('rel=consent-requests')
  );
  if (consentRequestsLink) {
    const consentRequestsLinkTarget = consentRequestsLink.value?.match(/<(.*)>/)?.[1];
    if (consentRequestsLinkTarget) {
      const consentRequestsResourceUrl = new URL(consentRequestsLinkTarget, url).href;
      const consentRequestsResource = await getConsentRequestsResource(consentRequestsResourceUrl);
      consentRequestsList = consentRequestsResource.consentRequests;
    }
  }

  await stuffShouldHaveLoadedByNow;

  if (consentRequestsList !== undefined) {
    await requestConsent({ consentRequestsList, tabId, pageUrl: url });
  } else {
    // This site does not ask consent through HTTP.
    // Note that it might still request consent through JS.
    await pageDoesNotRequestConsent(tabId, url);
  }
}

async function onWebRequestCompleted({ responseHeaders, url, tabId }: OnWebRequestCompletedDetails) {
  if (tabId <= 0) return;
  try {
    await processReceivedHeaders({ responseHeaders, url, tabId });
  } catch (error) {
    console.error(error.message, ' — ', `tabId=${tabId}`, `url=${url}`);
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

export {}
