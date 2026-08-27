const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Cryptographically random short code (letters + numbers). */
export function generateShortCode(length = 7): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return code;
}

export const SHORT_CODE_PATTERN = /^[A-Za-z0-9]{6,8}$/;

export type UrlValidation = { ok: true; url: string } | { ok: false; error: string };

/** Validates a user-supplied long URL. Only http(s) is accepted. */
export function validateLongUrl(input: unknown): UrlValidation {
  if (typeof input !== "string" || input.trim().length === 0) {
    return { ok: false, error: "Please enter a URL." };
  }
  const value = input.trim();
  if (value.length > 2048) {
    return { ok: false, error: "URL is too long (max 2048 characters)." };
  }
  if (!/^https?:\/\//i.test(value)) {
    return { ok: false, error: "URL must start with http:// or https://" };
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }
  if (!parsed.hostname.includes(".") || parsed.hostname.endsWith(".")) {
    return { ok: false, error: "Please enter a valid domain, e.g. https://example.com" };
  }
  return { ok: true, url: parsed.toString() };
}
