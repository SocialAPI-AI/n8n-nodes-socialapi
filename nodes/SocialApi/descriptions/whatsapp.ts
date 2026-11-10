import type { INodeProperties } from 'n8n-workflow';
const showFor = (ops: string[]) => ({ show: { resource: ['whatsapp'], operation: ops } });

export const whatsappFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['whatsapp'] } },
		options: [
			{ name: 'List Templates', value: 'listTemplates', action: 'List message templates' },
			{ name: 'Send Template', value: 'sendTemplate', action: 'Send a template message' },
		],
		default: 'sendTemplate',
	},
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: showFor(['listTemplates', 'sendTemplate']),
		description: 'The connected WhatsApp account',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		placeholder: '15551234567',
		displayOptions: showFor(['sendTemplate']),
		description: 'Recipient phone number in international format, without the leading +',
	},
	{
		displayName: 'Template Name',
		name: 'template_name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'order_confirmation',
		displayOptions: showFor(['sendTemplate']),
		description: 'An approved template on this account. Template messages can be sent outside the 24-hour window.',
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'en_US',
		required: true,
		displayOptions: showFor(['sendTemplate']),
		description: 'Language code of an approved variant of the template, such as en_US or fr_FR',
	},
	{
		displayName: 'Components',
		name: 'components',
		type: 'json',
		default: '[]',
		displayOptions: showFor(['sendTemplate']),
		description:
			'Values for the template’s header, body and button placeholders, in WhatsApp’s component format, for example [{"type":"body","parameters":[{"type":"text","text":"Ada"}]}]. Parameters must follow the placeholder order.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1 },
		displayOptions: showFor(['listTemplates']),
		description: 'Max number of results to return',
	},
];
