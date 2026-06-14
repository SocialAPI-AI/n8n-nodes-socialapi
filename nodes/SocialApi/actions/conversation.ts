import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../transport';

export async function execute(this: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	const list = async (path: string, qs: IDataObject) => {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) return wrap(await apiRequestAllItems.call(this, 'GET', path, qs));
		qs.limit = this.getNodeParameter('limit', i) as number;
		const res = await apiRequest.call(this, 'GET', path, undefined, qs);
		return wrap(res.data ?? res);
	};

	if (operation === 'getAll') {
		const filters = this.getNodeParameter('filters', i) as IDataObject;
		const qs: IDataObject = {};
		for (const [k, v] of Object.entries(filters)) if (v) qs[k] = v;
		return list('/inbox/conversations', qs);
	}

	const id = this.getNodeParameter('conversationId', i) as string;
	switch (operation) {
		case 'get': return wrap(await apiRequest.call(this, 'GET', `/inbox/conversations/${id}`));
		case 'listMessages': return list(`/inbox/conversations/${id}/messages`, {});
		case 'send': return wrap(await apiRequest.call(this, 'POST', `/inbox/conversations/${id}/messages`, { text: this.getNodeParameter('text', i) }));
		case 'markRead': return wrap(await apiRequest.call(this, 'POST', `/inbox/conversations/${id}/read`));
		case 'update': return wrap(await apiRequest.call(this, 'PATCH', `/inbox/conversations/${id}`, { is_read: this.getNodeParameter('is_read', i) }));
		default: throw new Error(`Unknown conversation operation: ${operation}`);
	}
}
