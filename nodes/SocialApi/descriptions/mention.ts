import type { INodeProperties } from 'n8n-workflow';

export const mentionFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['mention'] } },
		options: [{ name: 'Get Many', value: 'getAll', action: 'Get many mentions' }],
		default: 'getAll',
	},
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['mention'], operation: ['getAll'] } },
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['mention'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['mention'], operation: ['getAll'], returnAll: [false] } },
	},
];
