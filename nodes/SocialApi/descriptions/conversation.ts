import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['conversation'], operation: ops } });

export const conversationFields: INodeProperties[] = [
	{
		displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
		displayOptions: { show: { resource: ['conversation'] } },
		options: [
			{ name: 'Get', value: 'get', action: 'Get a conversation' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many conversations' },
			{ name: 'List Messages', value: 'listMessages', action: 'List messages' },
			{ name: 'Mark Read', value: 'markRead', action: 'Mark a conversation as read' },
			{ name: 'Send Message', value: 'send', action: 'Send a direct message' },
			{ name: 'Update', value: 'update', action: 'Update a conversation' },
		],
		default: 'getAll',
	},
	{ displayName: 'Conversation ID', name: 'conversationId', type: 'string', default: '', required: true,
		displayOptions: showFor(['get', 'listMessages', 'send', 'markRead', 'update']) },
	{ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 3 }, default: '', required: true, displayOptions: showFor(['send']) },
	{ displayName: 'Is Read', name: 'is_read', type: 'boolean', default: true, displayOptions: showFor(['update']) },
	{
		displayName: 'Filters', name: 'filters', type: 'collection', placeholder: 'Add Filter', default: {},
		displayOptions: showFor(['getAll']),
		options: [
			{ displayName: 'Account ID', name: 'account_id', type: 'string', default: '' },
			{ displayName: 'Platform', name: 'platform', type: 'string', default: '' },
		],
	},
	{ displayName: 'Return All', name: 'returnAll', type: 'boolean', default: false, description: 'Whether to return all results or only up to a given limit', displayOptions: showFor(['getAll', 'listMessages']) },
	{ displayName: 'Limit', name: 'limit', type: 'number', default: 50, description: 'Max number of results to return', typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['conversation'], operation: ['getAll', 'listMessages'], returnAll: [false] } } },
];
