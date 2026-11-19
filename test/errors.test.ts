import type { IExecuteFunctions, IHookFunctions, INode } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { SocialApi } from '../nodes/SocialApi/SocialApi.node';
import { SocialApiTrigger } from '../nodes/SocialApiTrigger/SocialApiTrigger.node';

const node: INode = {
	id: 'n1',
	name: 'SocialAPI',
	type: 'n8n-nodes-socialapi.socialApi',
	typeVersion: 1,
	position: [0, 0],
	parameters: {},
};

/** Minimal execute context running the `queue` resource; `http` decides what the API call does. */
function executeCtx(operation: string, http: () => Promise<unknown>) {
	const params: Record<string, string> = { resource: 'queue', operation, brand_id: '' };
	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string) => params[name],
		continueOnFail: () => false,
		getNode: () => node,
		getCredentials: async () => ({ apiKey: 'k', baseUrl: 'https://api.test' }),
		helpers: {
			httpRequestWithAuthentication: http,
			returnJsonArray: (d: unknown) => [{ json: d }],
		},
	} as unknown as IExecuteFunctions;
}

describe('SocialApi.execute error handling', () => {
	const run = (ctx: IExecuteFunctions) => new SocialApi().execute.call(ctx);

	it('re-throws a NodeOperationError unchanged', async () => {
		const ctx = executeCtx('bogus', async () => ({}));
		await expect(run(ctx)).rejects.toBeInstanceOf(NodeOperationError);
		await expect(run(ctx)).rejects.toThrow('Unknown queue operation: bogus');
	});

	it('re-throws an existing NodeApiError as the same instance', async () => {
		const apiError = new NodeApiError(node, { message: 'nope' }, { httpCode: '403' });
		const ctx = executeCtx('getAll', async () => {
			throw apiError;
		});
		await expect(run(ctx)).rejects.toBe(apiError);
	});

	it('wraps a raw error in NodeApiError carrying the item index', async () => {
		const ctx = executeCtx('getAll', async () => {
			throw Object.assign(new Error('boom'), { httpCode: '500' });
		});
		const err = await run(ctx).catch((e) => e);
		expect(err).toBeInstanceOf(NodeApiError);
		expect(err.context.itemIndex).toBe(0);
	});
});

/** Minimal hook context for the trigger's webhook `delete` lifecycle method. */
function hookCtx(http: () => Promise<unknown>) {
	const staticData: Record<string, unknown> = { webhookId: 'wh_1', webhookSecret: 's' };
	const warn = jest.fn();
	const ctx = {
		getWorkflowStaticData: () => staticData,
		getNode: () => node,
		getCredentials: async () => ({ apiKey: 'k', baseUrl: 'https://api.test' }),
		helpers: { httpRequestWithAuthentication: http },
		logger: { warn },
	} as unknown as IHookFunctions;
	return { ctx, staticData, warn };
}

describe('SocialApiTrigger webhook delete', () => {
	const del = (ctx: IHookFunctions) =>
		new SocialApiTrigger().webhookMethods.default.delete.call(ctx);

	it('treats a 404 as already deleted, without warning', async () => {
		const { ctx, staticData, warn } = hookCtx(async () => {
			throw new NodeApiError(node, { message: 'not found' }, { httpCode: '404' });
		});
		await expect(del(ctx)).resolves.toBe(true);
		expect(warn).not.toHaveBeenCalled();
		expect(staticData.webhookId).toBeUndefined();
	});

	it('logs any other failure instead of swallowing it, and still deactivates', async () => {
		const { ctx, staticData, warn } = hookCtx(async () => {
			throw new NodeApiError(node, { message: 'upstream down' }, { httpCode: '503' });
		});
		await expect(del(ctx)).resolves.toBe(true);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('wh_1');
		expect(staticData.webhookId).toBeUndefined();
	});
});
