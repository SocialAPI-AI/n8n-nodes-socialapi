import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { allFields } from './descriptions';
import * as account from './actions/account';
import * as post from './actions/post';
import * as comment from './actions/comment';
import * as conversation from './actions/conversation';
import * as review from './actions/review';
import * as mention from './actions/mention';
import * as brand from './actions/brand';
import * as media from './actions/media';

const handlers: Record<string, (this: IExecuteFunctions, op: string, i: number) => Promise<INodeExecutionData[]>> = {
	account: account.execute,
	post: post.execute,
	comment: comment.execute,
	conversation: conversation.execute,
	review: review.execute,
	mention: mention.execute,
	brand: brand.execute,
	media: media.execute,
};

export class SocialApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SocialAPI',
		name: 'socialApi',
		icon: 'file:socialApi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage social accounts, posts, and the inbox via SocialAPI',
		defaults: { name: 'SocialAPI' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'socialApiApi', required: true }],
		properties: allFields,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const handler = handlers[resource];
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const rows = await handler.call(this, operation, i);
				returnData.push(...rows);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
