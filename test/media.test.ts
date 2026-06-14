import { runUpload } from '../nodes/SocialApi/actions/media';

function makeCtx(buffer: Buffer) {
	const calls: any[] = [];
	const ctx: any = {
		getNodeParameter: (name: string) => {
			const params: Record<string, unknown> = {
				source: 'binary', binaryPropertyName: 'data', uploadOptions: {},
			};
			return params[name];
		},
		helpers: {
			assertBinaryData: () => ({ fileName: 'clip.mp4', mimeType: 'video/mp4' }),
			getBinaryDataBuffer: async () => buffer,
			httpRequest: async (opts: any) => { calls.push(['put', opts]); return {}; },
		},
	};
	return { ctx, calls };
}

describe('runUpload (bundled presign -> PUT -> verify)', () => {
	it('presigns with detected filename/type, PUTs the buffer, then verifies', async () => {
		const buffer = Buffer.from('x');
		const { ctx, calls } = makeCtx(buffer);
		const api: string[] = [];
		const apiRequest = async (_ctx: any, method: string, path: string, _body?: any, qs?: any) => {
			api.push(`${method} ${path}`);
			if (path === '/media/upload-url') return { media_id: 'med_1', upload_url: 'https://s3/put' };
			if (path === '/media/med_1/verify') return { id: 'med_1', status: 'ready' };
			return {};
		};
		const result = await runUpload(ctx, 0, apiRequest as any);
		expect(api).toEqual(['GET /media/upload-url', 'POST /media/med_1/verify']);
		expect(calls[0][0]).toBe('put');
		expect(calls[0][1].method).toBe('PUT');
		expect(calls[0][1].url).toBe('https://s3/put');
		expect(calls[0][1].body).toBe(buffer);
		expect(result).toEqual({ id: 'med_1', status: 'ready' });
	});
});
