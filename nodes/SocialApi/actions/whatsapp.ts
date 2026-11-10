import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../transport';

export async function execute(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const wrap = (d: unknown): INodeExecutionData[] => this.helpers.returnJsonArray(d as IDataObject);
	const id = this.getNodeParameter('accountId', i) as string;
	const path = `/platforms/whatsapp/accounts/${id}`;

	if (operation === 'listTemplates') {
		// shortcut: one page of up to 100 templates, no paging.cursors.after follow-up; add it if a WABA outgrows that.
		const limit = Math.min(this.getNodeParameter('limit', i) as number, 100); // API maximum
		const res = await apiRequest.call(this, 'GET', `${path}/templates`, undefined, { limit });
		return wrap(res.data ?? res);
	}
	if (operation === 'sendTemplate') {
		const body: IDataObject = {
			to: this.getNodeParameter('to', i),
			template_name: this.getNodeParameter('template_name', i),
			language: this.getNodeParameter('language', i),
		};
		const raw = this.getNodeParameter('components', i, '[]');
		let components: unknown;
		try {
			components = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
		} catch {
			throw new NodeOperationError(this.getNode(), 'Components must be valid JSON', { itemIndex: i });
		}
		if (!Array.isArray(components))
			throw new NodeOperationError(this.getNode(), 'Components must be a JSON array', { itemIndex: i });
		if (components.length) body.components = components;
		return wrap(await apiRequest.call(this, 'POST', `${path}/send-template`, body));
	}
	throw new NodeOperationError(this.getNode(), `Unknown WhatsApp operation: ${operation}`);
}
