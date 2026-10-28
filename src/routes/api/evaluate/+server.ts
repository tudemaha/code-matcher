import type { RequestHandler } from './$types';
import { connectDB } from '#lib/server/db';
import { CodeModel } from '#lib/server/models/Code';
import { getOrCreateConfig } from '#lib/server/models/Config';
import { evaluateCodeWithDeepSeek } from '#lib/server/ai';

interface EvaluateRequestBody {
	codeId?: string;
	studentCode?: string;
	pin?: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as EvaluateRequestBody;
		const { codeId, studentCode, pin } = body;

		if (!codeId) {
			return Response.json(
				{ success: false, error: 'Reference Code ID is required.' },
				{ status: 400 }
			);
		}

		if (studentCode === undefined || studentCode === null) {
			return Response.json(
				{ success: false, error: 'Student code is required for evaluation.' },
				{ status: 400 }
			);
		}

		if (!pin) {
			return Response.json(
				{ success: false, error: 'Access PIN is required to run AI evaluation.' },
				{ status: 401 }
			);
		}

		await connectDB();

		// 1. Verify Access PIN
		const config = await getOrCreateConfig();
		if (pin.trim() !== config.access_pin.trim()) {
			return Response.json(
				{ success: false, error: 'Invalid access PIN. Please ask your tutor for the valid PIN.' },
				{ status: 401 }
			);
		}

		// 2. Fetch Reference Code
		const codeDoc = await CodeModel.findById(codeId);
		if (!codeDoc) {
			return Response.json(
				{ success: false, error: 'Reference code not found or has expired after 48 hours.' },
				{ status: 404 }
			);
		}

		// 3. Call DeepSeek AI
		const result = await evaluateCodeWithDeepSeek(
			codeDoc.code,
			studentCode,
			codeDoc.programming_language
		);

		// 4. Update Config stats
		config.request_count = (config.request_count || 0) + 1;
		config.last_used_at = new Date();
		await config.save();

		return Response.json({
			success: true,
			result
		});
	} catch (err: unknown) {
		const errorMessage =
			err instanceof Error ? err.message : 'An error occurred while evaluating the code.';
		console.error('API /api/evaluate error:', errorMessage);
		return Response.json(
			{
				success: false,
				error: errorMessage
			},
			{ status: 500 }
		);
	}
};
