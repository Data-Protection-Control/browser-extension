import type { ConsentRequestsList, ConsentRequest, ConsentRequestsResource } from "../types";

// TODO use a validation tool instead.

export function validateConsentRequest(consentRequest: ConsentRequest) {
  if (
    typeof consentRequest.id !== 'string'
    || typeof consentRequest.text !== 'string'
  ) {
    throw new TypeError('Malformed consent request');
  }
}

export function validateConsentRequestsList(consentRequestsList: ConsentRequestsList) {
  if (!Array.isArray(consentRequestsList)) {
    throw new TypeError('Consent requests lists should be an array');
  }
  for (const item of consentRequestsList) {
    validateConsentRequest(item);
  }
}

export function validateConsentRequestsResource(consentRequestsResource: ConsentRequestsResource) {
  validateConsentRequestsList(consentRequestsResource.consentRequests);
}
