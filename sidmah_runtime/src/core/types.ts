export type InboxKind = "cell" | "start" | "result";
export type InboxState = "pending" | "submitting" | "submitted" | "active" | "completed" | "failed" | "cancelled";

export interface CellMeaning { responsibility: string }
export interface StartMeaning {
  objective: string;
  referenceScope: string;
  workInstructions: string;
  deliverables: string;
  comparisonCriteria: string;
}
export interface EndMeaning {
  producedArtifacts: string;
  outputAudit: string;
  visualDifferences: string;
  unresolvedIssues: string;
  revisionAdvice: string;
  referenceEvidence: string;
}

export interface ProviderDeliveryRequest {
  deliveryId: string;
  providerSessionId: string;
  kind: "cell" | "start" | "result" | "end";
  payload: unknown;
}
export interface ProviderAcceptance { accepted: boolean; processingStarted: boolean }
export interface ProviderHarness {
  deliver(request: ProviderDeliveryRequest): Promise<ProviderAcceptance>;
  redeliver?(request: ProviderDeliveryRequest): Promise<void>;
  terminate(providerSessionId: string, reason: string): Promise<void>;
}
