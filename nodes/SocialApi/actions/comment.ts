import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

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

	if (operation === 'listPosts') {
		const acc = this.getNodeParameter('account_id', i) as string;
		return list('/inbox/comments', acc ? { account_id: acc } : {});
	}

	const postId = this.getNodeParameter('postId', i) as string;
	if (operation === 'getAll') return list(`/inbox/comments/${postId}`, {});
	if (operation === 'reply') {
		const body: IDataObject = { text: this.getNodeParameter('text', i) };
		const parent = this.getNodeParameter('replyToCommentId', i) as string;
		if (parent) body.comment_id = parent;
		return wrap(await apiRequest.call(this, 'POST', `/inbox/comments/${postId}`, body));
	}

	const commentId = this.getNodeParameter('commentId', i) as string;
	switch (operation) {
		case 'getReplies':
			return list(`/inbox/comments/${postId}/${commentId}/replies`, {});
		case 'delete':
			return wrap(await apiRequest.call(this, 'DELETE', `/inbox/comments/${postId}/${commentId}`));
		case 'hide':
			return wrap(
				await apiRequest.call(this, 'POST', `/inbox/comments/${postId}/${commentId}/hide`),
			);
		case 'unhide':
			return wrap(
				await apiRequest.call(this, 'DELETE', `/inbox/comments/${postId}/${commentId}/hide`),
			);
		case 'like':
			return wrap(
				await apiRequest.call(this, 'POST', `/inbox/comments/${postId}/${commentId}/like`),
			);
		case 'unlike':
			return wrap(
				await apiRequest.call(this, 'DELETE', `/inbox/comments/${postId}/${commentId}/like`),
			);
		case 'privateReply':
			return wrap(
				await apiRequest.call(
					this,
					'POST',
					`/inbox/comments/${postId}/${commentId}/private-reply`,
					{ text: this.getNodeParameter('text', i) },
				),
			);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown comment operation: ${operation}`);
	}
}
