import { error, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectDB } from '#lib/server/db';
import { CodeModel, type ICode } from '#lib/server/models/Code';
import { getOrCreateConfig } from '#lib/server/models/Config';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	try {
		await connectDB();
		const [codeDoc, config] = await Promise.all([
			CodeModel.findById(id).lean<ICode>(),
			getOrCreateConfig()
		]);

		if (!codeDoc) {
			throw error(404, 'Reference code not found or it has expired after 48 hours.');
		}

		const createdAt = codeDoc.created_at ? new Date(codeDoc.created_at) : new Date();
		const expiresAt = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

		return {
			code: {
				id: codeDoc._id.toString(),
				title: codeDoc.title,
				programming_language: codeDoc.programming_language,
				code: codeDoc.code,
				created_at: createdAt.toISOString(),
				expires_at: expiresAt.toISOString()
			},
			defaultPin: config.access_pin || '123456'
		};
	} catch (err: unknown) {
		if (isHttpError(err)) throw err;
		console.error('Error loading code detail:', err);
		const errorMessage =
			err instanceof Error ? err.message : 'Database error while retrieving reference code.';
		throw error(500, errorMessage);
	}
};
