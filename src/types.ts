// Interfaces corresponding to definitions in the specification

export interface ConsentRequestsList {
  [requestId: string]: string | undefined,
}

export interface ConsentRequestsResource {
  consentRequests: ConsentRequestsList,
}


// Interfaces not defined in the specification

export interface ConsentResponses {
  [requestId: string]: boolean | undefined,
}
