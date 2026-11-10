import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems, toRfc3339 } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	const id = this.getNodeParameter('accountId', i) as string;
	const path = `/accounts/${id}/mentions`;

	if (operation === 'reply') {
		const body: IDataObject = {
			media_id: this.getNodeParameter('mediaId', i),
			text: this.getNodeParameter('text', i),
		};
		const commentId = this.getNodeParameter('commentId', i) as string;
		if (commentId) body.comment_id = commentId;
		return wrap(await apiRequest.call(this, 'POST', `${path}/reply`, body));
	}
	if (operation !== 'getAll')
		throw new NodeOperationError(this.getNode(), `Unknown mention operation: ${operation}`);

	const since = toRfc3339(this.getNodeParameter('since', i));
	const qs: IDataObject = since ? { since } : {};
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', path, qs));
	qs.limit = this.getNodeParameter('limit', i) as number;
	const res = await apiRequest.call(this, 'GET', path, undefined, qs);
	return wrap(res.data ?? res);
}
