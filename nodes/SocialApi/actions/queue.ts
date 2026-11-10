import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	if (operation !== 'getAll')
		throw new NodeOperationError(this.getNode(), `Unknown queue operation: ${operation}`);
	const brand_id = this.getNodeParameter('brand_id', i) as string;
	const res = await apiRequest.call(this, 'GET', '/queues', undefined, brand_id ? { brand_id } : {});
	return this.helpers.returnJsonArray((res.data ?? res) as IDataObject);
}
