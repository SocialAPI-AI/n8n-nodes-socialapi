import type { IDataObject, IExecuteFunctions, IHttpRequestMethods, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

type ApiRequestFn = (
	ctx: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
) => Promise<any>;

const boundApiRequest: ApiRequestFn = (ctx, method, path, body, qs) => apiRequest.call(ctx, method, path, body, qs);

/**
 * Bundled presigned upload: get upload URL -> binary PUT to S3 -> verify.
 * Uses the presigned flow (not the 50 MB proxy route), so large files work.
 * `req` is injectable for testing.
 */
export async function runUpload(ctx: IExecuteFunctions, i: number, req: ApiRequestFn = boundApiRequest): Promise<IDataObject> {
	const source = ctx.getNodeParameter('source', i) as string;
	const opts = ctx.getNodeParameter('uploadOptions', i) as IDataObject;

	let buffer: Buffer;
	let filename: string;
	let mediaType: string;

	if (source === 'binary') {
		const prop = ctx.getNodeParameter('binaryPropertyName', i) as string;
		const meta = ctx.helpers.assertBinaryData(i, prop);
		buffer = await ctx.helpers.getBinaryDataBuffer(i, prop);
		filename = (opts.filename as string) || meta.fileName || 'upload.bin';
		mediaType = (opts.media_type as string) || meta.mimeType || 'application/octet-stream';
	} else {
		const url = ctx.getNodeParameter('url', i) as string;
		const res = await ctx.helpers.httpRequest({ method: 'GET', url, returnFullResponse: true, encoding: 'arraybuffer' } as any);
		buffer = Buffer.from(res.body as ArrayBuffer);
		const headerType = (res.headers?.['content-type'] as string) || '';
		filename = (opts.filename as string) || url.split('/').pop()?.split('?')[0] || 'upload.bin';
		mediaType = (opts.media_type as string) || headerType || 'application/octet-stream';
	}

	// 1. Presign.
	const info = await req(ctx, 'GET', '/media/upload-url', undefined, { media_type: mediaType, filename });
	// 2. Binary PUT straight to storage (no API server size cap).
	await ctx.helpers.httpRequest({ method: 'PUT', url: info.upload_url, body: buffer, headers: { 'Content-Type': mediaType } } as any);
	// 3. Verify -> ready MediaItem.
	return (await req(ctx, 'POST', `/media/${info.media_id}/verify`)) as IDataObject;
}

export async function execute(this: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	switch (operation) {
		case 'upload': return wrap(await runUpload(this, i));
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', '/media/', {}));
			const limit = this.getNodeParameter('limit', i) as number;
			const res = await apiRequest.call(this, 'GET', '/media/', undefined, { limit });
			return wrap(res.data ?? res);
		}
		case 'storage': return wrap(await apiRequest.call(this, 'GET', '/media/storage'));
		case 'delete': {
			const id = this.getNodeParameter('mediaId', i) as string;
			return wrap(await apiRequest.call(this, 'DELETE', `/media/${id}`));
		}
		default: throw new Error(`Unknown media operation: ${operation}`);
	}
}
