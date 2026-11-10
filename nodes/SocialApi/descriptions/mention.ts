import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['mention'], operation: ops } });

export const mentionFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['mention'] } },
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many mentions' },
			{ name: 'Reply', value: 'reply', action: 'Reply to a mention' },
		],
		default: 'getAll',
	},
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['getAll', 'reply']),
		description: 'The connected account that was mentioned',
	},
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['reply']),
		description: 'The post the mention is on, from the mention’s media_id',
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		default: '',
		displayOptions: showFor(['reply']),
		description:
			'Set this when the mention was in a comment. Leave it empty when the mention was in the post caption.',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: showFor(['reply']),
		description: 'The reply, posted as a public comment. Works on Instagram, Facebook, Threads and Bluesky.',
	},
	{
		displayName: 'Since',
		name: 'since',
		type: 'dateTime',
		default: '',
		displayOptions: showFor(['getAll']),
		description: 'Only return mentions created after this time',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: showFor(['getAll']),
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
