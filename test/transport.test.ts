import { buildRequestOptions } from '../nodes/SocialApi/transport';

describe('buildRequestOptions', () => {
	it('joins base URL, /v1 prefix, path, and query', () => {
		const opts = buildRequestOptions('https://api.social-api.ai', 'GET', '/posts', undefined, {
			status: 'published',
			limit: 25,
		});
		expect(opts.method).toBe('GET');
		expect(opts.url).toBe('https://api.social-api.ai/v1/posts');
		expect(opts.qs).toEqual({ status: 'published', limit: 25 });
		expect(opts.json).toBe(true);
	});

	it('strips a trailing slash on base URL and omits empty query', () => {
		const opts = buildRequestOptions('https://api.social-api.ai/', 'POST', '/brands', { name: 'Acme' });
		expect(opts.url).toBe('https://api.social-api.ai/v1/brands');
		expect(opts.body).toEqual({ name: 'Acme' });
		expect(opts.qs).toBeUndefined();
	});
});
