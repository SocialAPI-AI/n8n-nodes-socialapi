import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	if (operation === 'getAll') {
		const acc = this.getNodeParameter('account_id', i) as string;
		const qs: IDataObject = acc ? { account_id: acc } : {};
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', '/inbox/reviews', qs));
		qs.limit = this.getNodeParameter('limit', i) as number;
		const res = await apiRequest.call(this, 'GET', '/inbox/reviews', undefined, qs);
		return wrap(res.data ?? res);
	}
	if (operation === 'reply') {
		const id = this.getNodeParameter('reviewId', i) as string;
		return wrap(
			await apiRequest.call(this, 'POST', `/inbox/reviews/${id}/reply`, {
				text: this.getNodeParameter('text', i),
			}),
		);
	}
	throw new Error(`Unknown review operation: ${operation}`);
}
