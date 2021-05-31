// Interfaces corresponding to definitions in the specification

export interface ConsentRequest {
  text: string; // request text
  id: string; // request identifier
}

export type ConsentRequestsList = Array<ConsentRequest>;

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
