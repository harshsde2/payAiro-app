/**
 * Idempotency primitives for money movement.
 *
 * Two distinct concepts live here, and keeping them apart is the whole point:
 *
 * - An **intent signature** identifies WHAT the user is trying to do ("send 0.5 ETH
 *   to alice"). It is derived from the payload, so the same intent always produces
 *   the same signature, and changing the amount or the recipient produces a new one.
 *
 * - An **idempotency key** identifies a single attempt AT that intent. Every retry of
 *   the same intent reuses the same key, so a backend that dedupes on it can collapse
 *   them into one transaction.
 *
 * The mapping between the two is owned by `transactionGuard`, not by this module.
 */

const HEX = "0123456789abcdef";

const randomHex = (length: number): string => {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += HEX[Math.floor(Math.random() * 16)];
  }
  return out;
};

/**
 * RFC 4122 version-4 shaped identifier.
 *
 * `Math.random` is not cryptographically secure, and deliberately so: an idempotency
 * key does not need to be unguessable, only to not collide. The backend scopes dedupe
 * per user, so 122 random bits makes a collision within one user's history
 * effectively impossible. Keeping this dependency-free also keeps it synchronous and
 * unit-testable without native mocks.
 */
export const newIdempotencyKey = (): string => {
  const variant = HEX[(Math.floor(Math.random() * 4) + 8) % 16];
  return [
    randomHex(8),
    randomHex(4),
    `4${randomHex(3)}`,
    `${variant}${randomHex(3)}`,
    randomHex(12),
  ].join("-");
};

/**
 * Stable signature for a transaction INTENT.
 *
 * Pass every field that makes this transaction distinct from another one the user
 * might legitimately want to perform. Anything omitted means two different
 * transactions collapse into one signature and the second gets flagged as a
 * duplicate; anything extra (a timestamp, a nonce, a session id) means a genuine
 * retry looks like a new intent and loses its dedupe protection.
 */
export const buildIntentSignature = (
  parts: ReadonlyArray<string | number | null | undefined>,
): string =>
  parts
    .map((part) => (part === null || part === undefined ? "" : String(part).trim().toLowerCase()))
    .join("|");
