import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['brand'], operation: ops } });

export const brandFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['brand'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a brand' },
			{ name: 'Delete', value: 'delete', action: 'Delete a brand' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many brands' },
			{ name: 'Update', value: 'update', action: 'Update a brand' },
		],
		default: 'getAll',
	},
	{
		displayName: 'Brand ID',
		name: 'brandId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['update', 'delete']),
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['create', 'update']),
	},
];
