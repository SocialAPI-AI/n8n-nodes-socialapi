import { apiRequestAllItems, buildRequestOptions, toRfc3339 } from '../nodes/SocialApi/transport';

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

describe('apiRequestAllItems', () => {
	const run = (pages: object[]) => {
		const calls: any[] = [];
		const ctx: any = {
			getCredentials: async () => ({ baseUrl: 'https://api.test' }),
			helpers: {
				httpRequestWithAuthentication: async (_c: string, o: any) => {
					calls.push(o.qs);
					return pages[calls.length - 1];
				},
			},
		};
		return apiRequestAllItems.call(ctx, 'GET', '/x').then((items) => ({ items, calls }));
	};

	it('follows a cursor nested under pagination (inbox, posts)', async () => {
		const { items, calls } = await run([
			{ data: [{ id: 1 }], pagination: { has_more: true, next_cursor: 'p2' } },
			{ data: [{ id: 2 }], pagination: { has_more: false } },
		]);
		expect(items).toEqual([{ id: 1 }, { id: 2 }]);
		expect(calls[1]).toEqual({ cursor: 'p2' });
	});

	it('follows a top-level cursor (media, mentions)', async () => {
		const { items } = await run([{ data: [{ id: 1 }], next_cursor: 'p2' }, { data: [{ id: 2 }] }]);
		expect(items).toEqual([{ id: 1 }, { id: 2 }]);
	});
});

describe('toRfc3339', () => {
	it('adds the UTC offset the date picker omits, and leaves empty values out', () => {
		expect(toRfc3339('2026-01-01T00:00:00Z')).toBe('2026-01-01T00:00:00.000Z');
		expect(toRfc3339('2026-01-01T10:00:00+02:00')).toBe('2026-01-01T08:00:00.000Z');
		expect(toRfc3339('2026-01-01T10:00:00')).toMatch(/Z$/);
		expect(toRfc3339('')).toBeUndefined();
	});
});
