import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class SocialApiApi implements ICredentialType {
	name = 'socialApiApi';
	displayName = 'SocialAPI API';
	// Reuses the node's icon; the build copies it to the same relative path under dist/.
	icon: Icon = {
		light: 'file:../nodes/SocialApi/socialApi.svg',
		dark: 'file:../nodes/SocialApi/socialApi.svg',
	};
	documentationUrl = 'https://docs.social-api.ai';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your SocialAPI key (starts with sapi_key_)',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.social-api.ai',
			description: 'Override only for self-hosted or staging environments',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: { Authorization: '=Bearer {{$credentials.apiKey}}' },
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/usage',
		},
	};
}
