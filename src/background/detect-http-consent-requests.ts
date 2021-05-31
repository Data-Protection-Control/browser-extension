import type { ConsentRequestsResource } from '../types';
import { requestConsent, disablePageActionButton } from './user-interaction';
import { delay } from '../common/utils';
import { validateConsentRequestsResource } from '../common/type-validation';

type OnWebRequestCompletedDetails =
  & browser.webRequest._OnCompletedDetails
  & { responseHeaders: browser.webRequest.HttpHeaders };

async function handlePageWithConsentRequestsResource({
  resourceUrl,
  pageUrl,
  tabId,
}: {
  resourceUrl: string,
  pageUrl: string,
  tabId: number,
}) {
  const response = await fetch(resourceUrl);
  const json = await response.text();
  const resourceObj = JSON.parse(json) as ConsentRequestsResource;
  validateConsentRequestsResource(resourceObj);
  const consentRequestsList = resourceObj.consentRequests;
  await requestConsent({ consentRequestsList, tabId, pageUrl });
}

async function processReceivedHeaders({ responseHeaders, url, tabId }:
  Pick<OnWebRequestCompletedDetails, 'responseHeaders' | 'url' | 'tabId'>
) {
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
      await handlePageWithConsentRequestsResource({
        resourceUrl: consentRequestsResourceUrl,
        pageUrl: url,
        tabId,
      });
      return;
    }
  }
  // Wait a moment before changing the button to avoid the browser overriding it again (Chromium bug?).
  await delay(100, () => disablePageActionButton(tabId));
}

async function onWebRequestCompleted({ responseHeaders, url, tabId }: OnWebRequestCompletedDetails) {
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

export {}
