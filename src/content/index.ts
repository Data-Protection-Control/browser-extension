// @ts-ignore
import { remoteFunction } from 'webextension-rpc';
import { exposeToPage } from './page-script-rpc';
import type { ConsentRequestsList, UserDecisionsObject } from '../types';
import { setConsentRequestsList, getUserDecisions } from '../common/consent-request-management';
import { validateConsentRequestsList } from '../common/type-validation';
import type { RequestConsentParams } from '../background';
import './events';
import './popin';

const requestConsent = remoteFunction('requestConsent') as (args: RequestConsentParams) => Promise<void>;

exposeToPage({
  'navigator.dataProtectionControl.request': request,
});

async function request(consentRequestsList: ConsentRequestsList): Promise<UserDecisionsObject> {
  validateConsentRequestsList(consentRequestsList);

  const webPageOrigin = new URL(document.URL).origin;
  await setConsentRequestsList(webPageOrigin, consentRequestsList);

  await requestConsent({ consentRequestsList, pageUrl: document.URL });

  const userDecisions = await getUserDecisions(webPageOrigin);
  return userDecisions;
}
