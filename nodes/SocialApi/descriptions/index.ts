import type { INodeProperties } from 'n8n-workflow';
import { accountFields } from './account';
import { postFields } from './post';
import { commentFields } from './comment';
import { conversationFields } from './conversation';
import { reviewFields } from './review';
import { mentionFields } from './mention';
import { brandFields } from './brand';
import { mediaFields } from './media';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Account', value: 'account' },
		{ name: 'Brand', value: 'brand' },
		{ name: 'Comment', value: 'comment' },
		{ name: 'Conversation', value: 'conversation' },
		{ name: 'Media', value: 'media' },
		{ name: 'Mention', value: 'mention' },
		{ name: 'Post', value: 'post' },
		{ name: 'Review', value: 'review' },
	],
	default: 'post',
};

export const allFields: INodeProperties[] = [
	resourceProperty,
	...accountFields,
	...postFields,
	...commentFields,
	...conversationFields,
	...reviewFields,
	...mentionFields,
	...brandFields,
	...mediaFields,
];
