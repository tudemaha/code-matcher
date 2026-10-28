import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { connectDB } from '#lib/server/db';
import { CodeModel, type ICode } from '#lib/server/models/Code';
import { getOrCreateConfig } from '#lib/server/models/Config';

export const load: PageServerLoad = async () => {
	try {
		await connectDB();
		const [codes, config] = await Promise.all([
			CodeModel.find().sort({ created_at: -1 }).lean<ICode[]>(),
			getOrCreateConfig()
		]);

		return {
			dbConnected: true,
			codes: codes.map((c) => ({
				id: c._id.toString(),
				title: c.title,
				programming_language: c.programming_language,
				code: c.code,
				created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString()
			})),
			stats: {
				matcher_count: config.matcher_count || 0,
				request_count: config.request_count || 0,
				last_used_at: config.last_used_at ? config.last_used_at.toISOString() : null,
				last_created_at: config.last_created_at ? config.last_created_at.toISOString() : null
			}
		};
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		console.warn('MongoDB connection error during load:', errorMessage);
		return {
			dbConnected: false,
			dbError: errorMessage,
			codes: [],
			stats: {
				matcher_count: 0,
				request_count: 0,
				last_used_at: null,
				last_created_at: null
			}
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString().trim();
		const programming_language = data.get('programming_language')?.toString().trim().toLowerCase();
		const code = data.get('code')?.toString();

		if (!title) {
			return fail(400, { title, programming_language, code, error: 'Title is required' });
		}
		if (!programming_language) {
			return fail(400, {
				title,
				programming_language,
				code,
				error: 'Programming language is required'
			});
		}
		if (!code || !code.trim()) {
			return fail(400, {
				title,
				programming_language,
				code,
				error: 'Reference code cannot be empty'
			});
		}

		let createdId: string;
		try {
			await connectDB();
			const newCode = await CodeModel.create({
				title,
				programming_language,
				code,
				created_at: new Date()
			});

			// Update config counters
			const config = await getOrCreateConfig();
			config.matcher_count = (config.matcher_count || 0) + 1;
			config.last_created_at = new Date();
			await config.save();

			createdId = newCode._id.toString();
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to save code reference';
			return fail(500, {
				title,
				programming_language,
				code,
				error: errorMessage
			});
		}

		throw redirect(303, `/code/${createdId}`);
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Code ID is required' });

		try {
			await connectDB();
			await CodeModel.findByIdAndDelete(id);
			return { success: true };
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete code reference';
			return fail(500, { error: errorMessage });
		}
	}
};
