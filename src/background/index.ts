// @ts-ignore
import { makeRemotelyCallable } from 'webextension-rpc';
import './detect-http-consent-requests';
import './send-http-adpc-header';
import { requestConsent, hidePopin } from './user-interaction';

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

  // Enable the pop-in to close itself (tabId is read from the calling tab), and
  // enable the pop-up to close the pop-in (tabId is passed as parameter).
  hidePopin: async ({ tab }: { tab: browser.tabs.Tab }, tabId: number) => {
    await hidePopin(tabId ?? tab.id as number);
  },
}, { insertExtraArg: true });

export {}
