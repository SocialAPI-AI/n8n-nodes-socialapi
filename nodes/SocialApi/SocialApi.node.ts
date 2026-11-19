import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { allFields } from './descriptions';
import * as account from './actions/account';
import * as post from './actions/post';
import * as comment from './actions/comment';
import * as conversation from './actions/conversation';
import * as review from './actions/review';
import * as mention from './actions/mention';
import * as brand from './actions/brand';
import * as media from './actions/media';
import * as queue from './actions/queue';
import * as whatsapp from './actions/whatsapp';

const handlers: Record<
	string,
	(this: IExecuteFunctions, op: string, i: number) => Promise<INodeExecutionData[]>
> = {
	account: account.execute,
	post: post.execute,
	comment: comment.execute,
	conversation: conversation.execute,
	review: review.execute,
	mention: mention.execute,
	brand: brand.execute,
	media: media.execute,
	queue: queue.execute,
	whatsapp: whatsapp.execute,
};

export class SocialApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SocialAPI',
		name: 'socialApi',
		// The icon carries its own white background, so one file suits both themes.
		icon: { light: 'file:socialApi.svg', dark: 'file:socialApi.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage social accounts, posts, and the inbox via SocialAPI',
		defaults: { name: 'SocialAPI' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
				// Both constructors return an existing instance of their own class
				// unchanged, so already-typed errors (e.g. NodeOperationError from an
				// unknown operation, NodeApiError from the HTTP helper) keep their own
				// context; anything else is wrapped so the failed request's status code
				// and body reach the workflow.
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}
		return [returnData];
	}
}
