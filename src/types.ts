// Interfaces corresponding to definitions in the specification

export interface ConsentRequestsList {
  [requestId: string]: string | undefined,
}

export interface ConsentRequestsResource {
  consentRequests: ConsentRequestsList,
}

export interface UserDecisionsObject {
  consent?: string[],
  withdraw?: string[],
  object?: string[],
}


// Interfaces not defined in the specification

export interface ConsentResponses {
  [requestId: string]: boolean | undefined,
}
