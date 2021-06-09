// @ts-ignore
import { makeRemotelyCallable } from 'webextension-rpc';
import './detect-http-consent-requests';
import './send-http-adpc-header';
import { requestConsent } from './user-interaction';

export type RequestConsentParams = Omit<Parameters<typeof requestConsent>[0], 'tabId'>;

async function requestConsentWrapper(
  { tab }: { tab: browser.tabs.Tab },
  actualArguments: RequestConsentParams,
) {
  // Call requestConsent with the tabId it is being called from.
  if (tab.id === undefined || tab.id <= 0) { // (impossible?)
    throw new Error(`requestConsent was invoked from a tab with id ${tab.id}`);
  }
  return requestConsent({ ...actualArguments, tabId: tab.id });
}

makeRemotelyCallable({
  requestConsent: requestConsentWrapper,
}, { insertExtraArg: true });

export {}
