import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['review'], operation: ops } });

export const reviewFields: INodeProperties[] = [
	{
		displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
		displayOptions: { show: { resource: ['review'] } },
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many reviews' },
			{ name: 'Reply', value: 'reply', action: 'Reply to a review' },
		],
		default: 'getAll',
	},
	{ displayName: 'Review ID', name: 'reviewId', type: 'string', default: '', required: true, displayOptions: showFor(['reply']) },
	{ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 3 }, default: '', required: true, displayOptions: showFor(['reply']) },
	{ displayName: 'Account ID', name: 'account_id', type: 'string', default: '', displayOptions: showFor(['getAll']) },
	{ displayName: 'Return All', name: 'returnAll', type: 'boolean', default: false, description: 'Whether to return all results or only up to a given limit', displayOptions: showFor(['getAll']) },
	{ displayName: 'Limit', name: 'limit', type: 'number', default: 50, description: 'Max number of results to return', typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['review'], operation: ['getAll'], returnAll: [false] } } },
];
