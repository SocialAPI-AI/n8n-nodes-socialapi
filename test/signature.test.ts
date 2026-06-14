import { createHmac } from 'node:crypto';
import { verifySignature } from '../nodes/SocialApiTrigger/helpers';

const secret = 'whsec_test';
const body = JSON.stringify({ event: 'comment.received', data: { id: 'c1' } });
const valid = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');

describe('verifySignature', () => {
	it('accepts a correct signature', () => {
		expect(verifySignature(body, valid, secret)).toBe(true);
	});
	it('rejects a tampered body', () => {
		expect(verifySignature(body + 'x', valid, secret)).toBe(false);
	});
	it('rejects a wrong-length signature without throwing', () => {
		expect(verifySignature(body, 'sha256=deadbeef', secret)).toBe(false);
	});
	it('rejects an empty/undefined signature', () => {
		expect(verifySignature(body, '', secret)).toBe(false);
	});
});
