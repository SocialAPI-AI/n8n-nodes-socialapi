import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify an `X-SocialAPI-Signature` header value (format `sha256=<hex>`) against
 * the raw request body using HMAC-SHA256 and constant-time comparison.
 */
export function verifySignature(rawBody: string, signature: string, secret: string): boolean {
	if (!signature) return false;
	const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
	if (expected.length !== signature.length) return false;
	return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
