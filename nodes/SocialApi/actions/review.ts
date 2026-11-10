import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	const account_id = this.getNodeParameter('account_id', i) as string;
	if (operation === 'getAll') {
		const path = `/inbox/reviews/${account_id}`;
		const qs: IDataObject = { order: this.getNodeParameter('order', i) };
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', path, qs));
		qs.limit = this.getNodeParameter('limit', i) as number;
		const res = await apiRequest.call(this, 'GET', path, undefined, qs);
		return wrap(res.data ?? res);
	}
	if (operation === 'reply') {
		const id = this.getNodeParameter('reviewId', i) as string;
		return wrap(
			await apiRequest.call(this, 'POST', `/inbox/reviews/${id}/reply`, {
				account_id,
				text: this.getNodeParameter('text', i),
			}),
		);
	}
	throw new NodeOperationError(this.getNode(), `Unknown review operation: ${operation}`);
}
