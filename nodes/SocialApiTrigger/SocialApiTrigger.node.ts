import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequest } from '../SocialApi/transport';
import { verifySignature } from './helpers';

export class SocialApiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SocialAPI Trigger',
		name: 'socialApiTrigger',
		icon: 'file:socialApi.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts a workflow on SocialAPI events (comments, DMs, reviews, mentions, posts)',
		defaults: { name: 'SocialAPI Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'socialApiApi', required: true }],
		webhooks: [
			{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' },
		],
		properties: [
			{
				displayName: 'Event Names or IDs',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [],
				typeOptions: { loadOptionsMethod: 'getEvents' },
				description:
					'Which event types should start the workflow. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Account ID Filter',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'If set, only emit events for this connected account',
			},
		],
	};

	methods = {
		loadOptions: {
			async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const res = await apiRequest.call(this, 'GET', '/webhooks/events');
				const data = (res.data as IDataObject[]) ?? [];
				return data.map((e) => ({
					name: `${e.event as string}${e.description ? `: ${e.description as string}` : ''}`,
					value: e.event as string,
				}));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (!data.webhookId) return false;
				try {
					await apiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						`/webhooks/${data.webhookId as string}`,
					);
					return true;
				} catch {
					delete data.webhookId;
					delete data.webhookSecret;
					return false;
				}
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				if (!events.length)
					throw new NodeOperationError(this.getNode(), 'Select at least one event');
				const res = await apiRequest.call(
					this as unknown as IExecuteFunctions,
					'POST',
					'/webhooks',
					{ url, events },
				);
				const data = this.getWorkflowStaticData('node');
				data.webhookId = (res as IDataObject).id;
				data.webhookSecret = (res as IDataObject).secret;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId) {
					try {
						await apiRequest.call(
							this as unknown as IExecuteFunctions,
							'DELETE',
							`/webhooks/${data.webhookId as string}`,
						);
					} catch {
						// ignore: endpoint may already be gone
					}
					delete data.webhookId;
					delete data.webhookSecret;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = req.body as IDataObject;
		const staticData = this.getWorkflowStaticData('node');
		const secret = staticData.webhookSecret as string | undefined;

		// Verify against the RAW request bytes the server signed, not a
		// re-serialization of the parsed body (key order/whitespace would differ
		// and break the HMAC). n8n populates `req.rawBody` (a Buffer) for webhook
		// nodes; fall back to a stringify only if it is somehow absent.
		const signature = (this.getHeaderData()['x-socialapi-signature'] as string) || '';
		const rawBody = (req as any).rawBody
			? (req as any).rawBody.toString('utf8')
			: JSON.stringify(body);
		if (secret && !verifySignature(rawBody, signature, secret)) {
			const res = this.getResponseObject();
			res.status(401).send('invalid signature');
			return { noWebhookResponse: true };
		}

		// Registration handshake: ACK with 200, do not start a workflow run.
		const event = (body.event as string) || '';
		if (event === 'webhook.test' || (body.data as IDataObject)?.verification === true) {
			return { webhookResponse: { ok: true } };
		}

		// Optional account filter.
		const accountFilter = this.getNodeParameter('accountId') as string;
		if (accountFilter) {
			const evtAccount = ((body.data as IDataObject)?.account_id as string) || '';
			if (evtAccount && evtAccount !== accountFilter) {
				return { webhookResponse: { ok: true } };
			}
		}

		return { workflowData: [this.helpers.returnJsonArray(body)] };
	}
}
