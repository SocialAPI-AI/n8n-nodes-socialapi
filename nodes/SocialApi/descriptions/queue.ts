import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['queue'], operation: ops } });

export const queueFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['queue'] } },
		options: [{ name: 'Get Many', value: 'getAll', action: 'Get many queues' }],
		default: 'getAll',
	},
	{
		displayName: 'Brand ID',
		name: 'brand_id',
		type: 'string',
		default: '',
		displayOptions: showFor(['getAll']),
		description: 'Only list the Queues of this Brand (leave empty for all Brands)',
	},
];
