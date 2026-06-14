import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../transport';

export async function execute(this: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	switch (operation) {
		case 'getAll': {
			const brand = this.getNodeParameter('brand_id', i) as string;
			const res = await apiRequest.call(this, 'GET', '/accounts', undefined, brand ? { brand_id: brand } : {});
			return wrap(res.data ?? res);
		}
		case 'listPages': {
			const id = this.getNodeParameter('accountId', i) as string;
			const res = await apiRequest.call(this, 'GET', `/accounts/${id}/pages`);
			return wrap(res.data ?? res);
		}
		case 'getLimits': {
			const id = this.getNodeParameter('accountId', i) as string;
			return wrap(await apiRequest.call(this, 'GET', `/accounts/${id}/limits`));
		}
		case 'connect': {
			const platform = this.getNodeParameter('platform', i) as string;
			return wrap(await apiRequest.call(this, 'POST', '/accounts/connect', { platform }));
		}
		case 'exchange': {
			const body: IDataObject = { code: this.getNodeParameter('code', i), state: this.getNodeParameter('state', i) };
			return wrap(await apiRequest.call(this, 'POST', '/oauth/exchange', body));
		}
		case 'disconnect': {
			const id = this.getNodeParameter('accountId', i) as string;
			return wrap(await apiRequest.call(this, 'DELETE', `/accounts/${id}`));
		}
		default: throw new Error(`Unknown account operation: ${operation}`);
	}
}
