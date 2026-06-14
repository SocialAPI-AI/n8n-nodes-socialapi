import type { INodeProperties } from 'n8n-workflow';

const showFor = (ops: string[]) => ({ show: { resource: ['post'], operation: ops } });

export const postFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['post'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a post' },
			{ name: 'Delete', value: 'delete', action: 'Delete a post' },
			{ name: 'Get', value: 'get', action: 'Get a post' },
			{ name: 'Get Constraints', value: 'getConstraints', action: 'Get publishing constraints' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many posts' },
			{ name: 'Get Metrics', value: 'getMetrics', action: 'Get post metrics' },
			{ name: 'Publish Draft', value: 'publish', action: 'Publish a draft post' },
			{ name: 'Retry', value: 'retry', action: 'Retry a failed post' },
			{ name: 'Unpublish', value: 'unpublish', action: 'Unpublish a post' },
			{ name: 'Update', value: 'update', action: 'Update a post' },
			{ name: 'Validate', value: 'validate', action: 'Validate a post' },
		],
		default: 'create',
	},
	// --- create / validate shared fields ---
	{
		displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 4 }, default: '',
		displayOptions: showFor(['create', 'validate']),
		description: 'The post body text',
	},
	{
		displayName: 'Targets', name: 'targets', type: 'fixedCollection',
		typeOptions: { multipleValues: true }, default: {},
		displayOptions: showFor(['create', 'validate']),
		description: 'Connected accounts to publish to',
		options: [{
			name: 'target', displayName: 'Target',
			values: [
				{ displayName: 'Account ID', name: 'account_id', type: 'string', default: '' },
				{ displayName: 'Page ID', name: 'page_id', type: 'string', default: '' },
			],
		}],
	},
	{
		displayName: 'Additional Fields', name: 'additionalFields', type: 'collection',
		placeholder: 'Add Field', default: {}, displayOptions: showFor(['create']),
		options: [
			{ displayName: 'First Comment', name: 'first_comment', type: 'string', default: '' },
			{ displayName: 'Media IDs', name: 'media_ids', type: 'string', default: '', description: 'Comma-separated media IDs from a Media → Upload step' },
			{ displayName: 'Publish Now', name: 'publish_now', type: 'boolean', default: false },
			{ displayName: 'Schedule At', name: 'scheduled_at', type: 'dateTime', default: '' },
			{ displayName: 'Skip Duplicate Check', name: 'skip_duplicate_check', type: 'boolean', default: false },
			{ displayName: 'Title', name: 'title', type: 'string', default: '' },
			{ displayName: 'Visibility', name: 'visibility', type: 'options', default: 'public',
				options: [{ name: 'Connections Only', value: 'connections_only' }, { name: 'Private', value: 'private' }, { name: 'Public', value: 'public' }] },
		],
	},
	// --- post id param ---
	{
		displayName: 'Post ID', name: 'postId', type: 'string', default: '', required: true,
		displayOptions: showFor(['get', 'update', 'delete', 'publish', 'retry', 'unpublish', 'getMetrics']),
	},
	// --- update fields ---
	{
		displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field',
		default: {}, displayOptions: showFor(['update']),
		options: [
			{ displayName: 'Schedule At', name: 'scheduled_at', type: 'dateTime', default: '' },
			{ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 4 }, default: '' },
		],
	},
	// --- unpublish optional account filter ---
	{
		displayName: 'Account IDs', name: 'account_ids', type: 'string', default: '',
		displayOptions: showFor(['unpublish']),
		description: 'Comma-separated account IDs to unpublish from (default: all)',
	},
	// --- list filters + pagination ---
	{ displayName: 'Return All', name: 'returnAll', type: 'boolean', default: false, displayOptions: showFor(['getAll']), description: 'Whether to return all results or only up to a given limit' },
	{ displayName: 'Limit', name: 'limit', type: 'number', default: 50, typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['post'], operation: ['getAll'], returnAll: [false] } }, description: 'Max number of results to return' },
	{
		displayName: 'Filters', name: 'filters', type: 'collection', placeholder: 'Add Filter', default: {},
		displayOptions: showFor(['getAll']),
		options: [
			{ displayName: 'Account IDs', name: 'account_ids', type: 'string', default: '' },
			{ displayName: 'From', name: 'from', type: 'dateTime', default: '' },
			{ displayName: 'Platform', name: 'platform', type: 'string', default: '' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '' },
			{ displayName: 'Status', name: 'status', type: 'string', default: '' },
			{ displayName: 'To', name: 'to', type: 'dateTime', default: '' },
		],
	},
];
