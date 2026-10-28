import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MONGODB_URI: {
		description: 'MongoDB Atlas connection string',
		schema: (val) => val || ''
	},
	DEEPSEEK_API_KEY: {
		description: 'DeepSeek AI API key',
		schema: (val) => val || ''
	},
	ACCESS_PIN: {
		description: 'Tutor access PIN for AI evaluation',
		schema: (val) => val || '123456'
	}
});
