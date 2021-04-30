import type { ConsentResponses } from "../types";

async function getConsentResponses(origin: string): Promise<ConsentResponses | undefined> {
  const key = `${origin}#responses`;
  const consentResponses = (await browser.storage.sync.get(key))[key] as ConsentResponses | undefined;
  return consentResponses;
}

function responsesToAdpcHeaderValue(consentResponses: ConsentResponses): string {
  const requestIdentifiersGivenConsent = Object.entries(consentResponses).filter(
    ([_requestIdentifier, isGivenConsent]) => (isGivenConsent === true)
  ).map(([requestIdentifier, _isGivenConsent]) => requestIdentifier);
  const AdpcHeaderValue = `consent="${requestIdentifiersGivenConsent.join(' ')}"`;
  return AdpcHeaderValue;
}

async function getAdpcHeaderValueForUrl(url: string): Promise<string> {
  const origin = new URL(url).origin;
  const consentResponses = await getConsentResponses(origin);
  return responsesToAdpcHeaderValue(consentResponses);
}

async function onBeforeSendHeaders({
  requestHeaders,
  tabId,
  url,
}: {
  requestHeaders: browser.webRequest.HttpHeaders,
  tabId: number,
  url: string,
}): Promise<browser.webRequest.BlockingResponse> {
  if (tabId <= 0) return;
  try {
    const AdpcHeaderValue = await getAdpcHeaderValueForUrl(url);
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

export {}
