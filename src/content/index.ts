import { exposeToPage } from './page-script-rpc';
import type { ConsentRequestsList, AdpcDecisions } from '../types';

exposeToPage({
  'navigator.dataProtectionControl.request': request,
});

async function request(consentRequestsList: ConsentRequestsList): Promise<AdpcDecisions> {
  return {
    consent: [],
    withdraw: ['*'],
    object: ['direct-marketing'],
  }
}

export {}
