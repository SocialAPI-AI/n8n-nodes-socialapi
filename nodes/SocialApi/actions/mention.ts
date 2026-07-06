import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	if (operation !== 'getAll')
		throw new NodeOperationError(this.getNode(), `Unknown mention operation: ${operation}`);
	const id = this.getNodeParameter('accountId', i) as string;
	const path = `/accounts/${id}/mentions`;
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', path, {}));
	const limit = this.getNodeParameter('limit', i) as number;
	const res = await apiRequest.call(this, 'GET', path, undefined, { limit });
	return wrap(res.data ?? res);
}
