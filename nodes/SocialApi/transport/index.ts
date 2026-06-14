import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

/** Pure builder for an n8n HTTP request against the SocialAPI v1 REST API. */
export function buildRequestOptions(
	baseUrl: string,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): IHttpRequestOptions {
	const base = baseUrl.replace(/\/+$/, '');
	const options: IHttpRequestOptions = {
		method,
		url: `${base}/v1${path}`,
		json: true,
	};
	if (body !== undefined) options.body = body;
	if (qs !== undefined && Object.keys(qs).length > 0) options.qs = qs;
	return options;
}

/** Make an authenticated request to SocialAPI. */
export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<any> {
	const credentials = await this.getCredentials('socialApiApi');
	const baseUrl = (credentials.baseUrl as string) || 'https://api.social-api.ai';
	const options = buildRequestOptions(baseUrl, method, path, body, qs);
	return this.helpers.httpRequestWithAuthentication.call(this, 'socialApiApi', options);
}

/**
 * Follow keyset pagination (`next_cursor`) until exhausted, collecting `data[]`.
 * SocialAPI list responses are shaped `{ data: [...], next_cursor?: string }`.
 */
export async function apiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const out: IDataObject[] = [];
	let cursor: string | undefined;
	do {
		const page: IDataObject = await apiRequest.call(this, method, path, undefined, {
			...qs,
			...(cursor ? { cursor } : {}),
		});
		const data = (page.data as IDataObject[]) ?? [];
		out.push(...data);
		cursor = (page.next_cursor as string) || undefined;
	} while (cursor);
	return out;
}
