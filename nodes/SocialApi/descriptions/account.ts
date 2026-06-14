import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['account'], operation: ops } });

export const accountFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Connect', value: 'connect', action: 'Start an account connection' },
			{ name: 'Disconnect', value: 'disconnect', action: 'Disconnect an account' },
			{ name: 'Exchange OAuth', value: 'exchange', action: 'Exchange an authorization code' },
			{ name: 'Get Limits', value: 'getLimits', action: 'Get account usage limits' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many accounts' },
			{ name: 'List Pages', value: 'listPages', action: 'List account pages' },
		],
		default: 'getAll',
	},
	{
		displayName: 'Brand ID',
		name: 'brand_id',
		type: 'string',
		default: '',
		displayOptions: showFor(['getAll']),
	},
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['disconnect', 'getLimits', 'listPages']),
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['connect']),
	},
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['exchange']),
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['exchange']),
	},
];
