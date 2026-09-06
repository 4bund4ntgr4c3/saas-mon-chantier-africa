/**
 * Signature électronique : empreinte déterministe du contenu d'un document
 * (SHA-256 via Web Crypto, repli FNV-1a 64 bits) pour vérifier afterward
 * qu'un PDF généré n'a pas été modifié depuis sa signature.
 */

/** Sérialisation stable : clés triées, pour une empreinte reproductible. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(",")}}`;
}

function fnv1a64(text: string): string {
  // FNV-1a 64 bits en deux 32 bits (JS n'a pas d'entiers 64 bits sûrs en bit ops).
  let hi = 0xcbf29ce4 >>> 0;
  let lo = 0x84222325 >>> 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    lo = (lo ^ (c & 0xff)) >>> 0;
    lo = Math.imul(lo, 0x01000193) >>> 0;
    hi = (hi ^ (c >>> 8)) >>> 0;
    hi = Math.imul(hi, 0x01000193) >>> 0;
  }
  return (hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0")).toUpperCase();
}

/** Empreinte courte du document (32 caractères max, affichable sur le PDF). */
export async function documentFingerprint(payload: unknown): Promise<string> {
  const canonical = canonicalize(payload);
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const buf = await subtle.digest("SHA-256", new TextEncoder().encode(canonical));
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32)
      .toUpperCase();
  }
  return fnv1a64(canonical + fnv1a64(canonical));
}

/** Formate l'empreinte par blocs de 4 pour l'affichage (XXXX-XXXX-…). */
export function formatFingerprint(fingerprint: string): string {
  return (fingerprint.match(/.{1,4}/g) ?? []).join("-");
}
