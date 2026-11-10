import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems, toRfc3339 } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	const list = async (path: string, qs: IDataObject) => {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', path, qs));
		qs.limit = this.getNodeParameter('limit', i) as number;
		const res = await apiRequest.call(this, 'GET', path, undefined, qs);
		return wrap(res.data ?? res);
	};

	const account_id = this.getNodeParameter('account_id', i) as string;
	if (operation === 'listPosts') {
		const qs: IDataObject = account_id ? { account_id } : {};
		const filters = this.getNodeParameter('filters', i) as IDataObject;
		for (const [k, v] of Object.entries(filters))
			if (v !== '' && v !== undefined) qs[k] = k === 'since' ? toRfc3339(v) : v;
		return list('/inbox/comments', qs);
	}

	const postId = this.getNodeParameter('postId', i) as string;
	if (operation === 'getAll') return list(`/inbox/comments/${postId}`, { account_id });
	if (operation === 'reply') {
		const body: IDataObject = { account_id, text: this.getNodeParameter('text', i) };
		const parent = this.getNodeParameter('replyToCommentId', i) as string;
		if (parent) body.comment_id = parent;
		return wrap(await apiRequest.call(this, 'POST', `/inbox/comments/${postId}`, body));
	}

	const commentId = this.getNodeParameter('commentId', i) as string;
	const path = `/inbox/comments/${postId}/${commentId}`;
	switch (operation) {
		case 'getReplies':
			return list(`${path}/replies`, { account_id });
		case 'delete':
			return wrap(await apiRequest.call(this, 'DELETE', path, undefined, { account_id }));
		case 'hide':
			return wrap(await apiRequest.call(this, 'POST', `${path}/hide`, { account_id }));
		case 'unhide':
			return wrap(await apiRequest.call(this, 'DELETE', `${path}/hide`, undefined, { account_id }));
		case 'like':
			return wrap(await apiRequest.call(this, 'POST', `${path}/like`, { account_id }));
		case 'unlike':
			return wrap(await apiRequest.call(this, 'DELETE', `${path}/like`, undefined, { account_id }));
		case 'privateReply':
			return wrap(
				await apiRequest.call(this, 'POST', `${path}/private-reply`, {
					account_id,
					text: this.getNodeParameter('text', i),
				}),
			);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown comment operation: ${operation}`);
	}
}
