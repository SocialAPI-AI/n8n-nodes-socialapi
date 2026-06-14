import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

const csv = (s: string): string[] => s.split(',').map((x) => x.trim()).filter(Boolean);

export async function execute(this: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);

	if (operation === 'create' || operation === 'validate') {
		const text = this.getNodeParameter('text', i) as string;
		const targetsRaw = (this.getNodeParameter('targets', i) as IDataObject).target as IDataObject[] | undefined;
		const targets = (targetsRaw ?? []).map((t) => {
			const out: IDataObject = { account_id: t.account_id };
			if (t.page_id) out.page_id = t.page_id;
			return out;
		});
		const body: IDataObject = { text, targets };
		if (operation === 'create') {
			const add = this.getNodeParameter('additionalFields', i) as IDataObject;
			if (add.title) body.title = add.title;
			if (add.media_ids) body.media_ids = csv(add.media_ids as string);
			if (add.visibility) body.visibility = add.visibility;
			if (add.first_comment) body.first_comment = add.first_comment;
			if (add.scheduled_at) body.scheduled_at = add.scheduled_at;
			if (add.publish_now) body.publish_now = add.publish_now;
			if (add.skip_duplicate_check) body.skip_duplicate_check = add.skip_duplicate_check;
		}
		const path = operation === 'create' ? '/posts' : '/posts/validate';
		return wrap(await apiRequest.call(this, 'POST', path, body));
	}

	if (operation === 'getAll') {
		const filters = this.getNodeParameter('filters', i) as IDataObject;
		const qs: IDataObject = {};
		for (const [k, v] of Object.entries(filters)) if (v) qs[k] = v;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', '/posts', qs));
		qs.limit = this.getNodeParameter('limit', i) as number;
		const res = await apiRequest.call(this, 'GET', '/posts', undefined, qs);
		return wrap(res.data ?? res);
	}

	if (operation === 'getConstraints') return wrap(await apiRequest.call(this, 'GET', '/posts/validate'));

	const postId = this.getNodeParameter('postId', i) as string;
	switch (operation) {
		case 'get': return wrap(await apiRequest.call(this, 'GET', `/posts/${postId}`));
		case 'getMetrics': return wrap(await apiRequest.call(this, 'GET', `/posts/${postId}/metrics`));
		case 'delete': return wrap(await apiRequest.call(this, 'DELETE', `/posts/${postId}`));
		case 'publish': return wrap(await apiRequest.call(this, 'POST', `/posts/${postId}/publish`));
		case 'retry': return wrap(await apiRequest.call(this, 'POST', `/posts/${postId}/retry`));
		case 'unpublish': {
			const ids = this.getNodeParameter('account_ids', i) as string;
			const body: IDataObject = ids ? { account_ids: csv(ids) } : {};
			return wrap(await apiRequest.call(this, 'POST', `/posts/${postId}/unpublish`, body));
		}
		case 'update': {
			const fields = this.getNodeParameter('updateFields', i) as IDataObject;
			return wrap(await apiRequest.call(this, 'PATCH', `/posts/${postId}`, fields));
		}
		default: throw new Error(`Unknown post operation: ${operation}`);
	}
}
