import { exposeToPage } from './page-script-rpc';
import type { ConsentRequestsList, UserDecisionsObject } from '../types';
import { updateConsentRequestsObject, getUserDecisions } from '../common/consent-request-management';

exposeToPage({
  'navigator.dataProtectionControl.request': request,
});

async function request(consentRequestsList: ConsentRequestsList): Promise<UserDecisionsObject> {
  const webPageOrigin = new URL(document.URL).origin;
  await updateConsentRequestsObject(webPageOrigin, consentRequestsList);

  // TODO Present the consent requests.

  const userDecisions = await getUserDecisions(webPageOrigin);
  return userDecisions;
}

export {}
