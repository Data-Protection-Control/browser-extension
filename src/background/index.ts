import { makeRemotelyCallable } from 'webextension-rpc';
import './detect-http-consent-requests';
import './send-http-adpc-header';
import { requestConsent } from './user-interaction';
import type { ConsentRequestsList } from '../types';

async function requestConsentWrapper(
  { tab }: { tab: browser.tabs.Tab },
  actualArguments: {
    consentRequestsList: ConsentRequestsList,
    pageUrl: string,
  },
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
