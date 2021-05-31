// @ts-ignore
import { remoteFunction } from 'webextension-rpc';
import { exposeToPage } from './page-script-rpc';
import type { ConsentRequestsList, UserDecisionsObject } from '../types';
import { updateConsentRequestsObject, getUserDecisions } from '../common/consent-request-management';
import { validateConsentRequestsList } from '../common/type-validation';
import './events';

const requestConsent = remoteFunction('requestConsent');

exposeToPage({
  'navigator.dataProtectionControl.request': request,
});

async function request(consentRequestsList: ConsentRequestsList): Promise<UserDecisionsObject> {
  validateConsentRequestsList(consentRequestsList);

  const webPageOrigin = new URL(document.URL).origin;
  await updateConsentRequestsObject(webPageOrigin, consentRequestsList);

  await requestConsent({ consentRequestsList, pageUrl: document.URL });

  const userDecisions = await getUserDecisions(webPageOrigin);
  return userDecisions;
}

export {}
