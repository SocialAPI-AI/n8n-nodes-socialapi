import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	switch (operation) {
		case 'getAll': {
			const res = await apiRequest.call(this, 'GET', '/brands');
			return wrap(res.data ?? res);
		}
		case 'create':
			return wrap(
				await apiRequest.call(this, 'POST', '/brands', { name: this.getNodeParameter('name', i) }),
			);
		case 'update': {
			const id = this.getNodeParameter('brandId', i) as string;
			return wrap(
				await apiRequest.call(this, 'PATCH', `/brands/${id}`, {
					name: this.getNodeParameter('name', i),
				}),
			);
		}
		case 'delete': {
			const id = this.getNodeParameter('brandId', i) as string;
			return wrap(await apiRequest.call(this, 'DELETE', `/brands/${id}`));
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown brand operation: ${operation}`);
	}
}
