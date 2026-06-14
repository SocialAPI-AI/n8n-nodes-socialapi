import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['media'], operation: ops } });

export const mediaFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['media'] } },
		options: [
			{ name: 'Delete', value: 'delete', action: 'Delete a media item' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many media items' },
			{ name: 'Get Storage Usage', value: 'storage', action: 'Get storage usage' },
			{ name: 'Upload', value: 'upload', action: 'Upload a media file' },
		],
		default: 'upload',
	},
	// Upload: source selector
	{
		displayName: 'Source',
		name: 'source',
		type: 'options',
		default: 'binary',
		displayOptions: showFor(['upload']),
		options: [
			{
				name: 'Binary File',
				value: 'binary',
				description: 'Use a binary property from a previous node',
			},
			{ name: 'URL', value: 'url', description: 'Fetch a file from a URL, then upload' },
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: { show: { resource: ['media'], operation: ['upload'], source: ['binary'] } },
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['media'], operation: ['upload'], source: ['url'] } },
	},
	{
		displayName: 'Options',
		name: 'uploadOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: showFor(['upload']),
		options: [
			{
				displayName: 'Content Type',
				name: 'media_type',
				type: 'string',
				default: '',
				description: 'Override the detected MIME type',
			},
			{
				displayName: 'File Name',
				name: 'filename',
				type: 'string',
				default: '',
				description: 'Override the detected file name',
			},
		],
	},
	// id param
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['delete']),
	},
	// list pagination
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		description: 'Whether to return all results or only up to a given limit',
		default: false,
		displayOptions: showFor(['getAll']),
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		description: 'Max number of results to return',
		default: 50,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['media'], operation: ['getAll'], returnAll: [false] } },
	},
];
