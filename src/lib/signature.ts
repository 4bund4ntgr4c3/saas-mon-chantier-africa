/**
 * Module de signature électronique tactile et horodatage légal BTP.
 */

export interface SignatureMetadata {
  signerName: string;
  signerRole: "client" | "artisan" | "architecte" | "controleur";
  timestamp: string;
  documentTitle: string;
  signatureDataUrl?: string | null;
  hash: string;
}

export function createSignatureMetadata(
  signerName: string,
  signerRole: "client" | "artisan" | "architecte" | "controleur",
  documentTitle: string,
  signatureDataUrl?: string | null,
): SignatureMetadata {
  const timestamp = new Date().toISOString();
  const hash = `SIG-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${Date.now()}`;

  return {
    signerName,
    signerRole,
    timestamp,
    documentTitle,
    signatureDataUrl: signatureDataUrl ?? null,
    hash,
  };
}
