export interface EvaluationIssue {
	line?: number | string;
	type: 'typo' | 'syntax' | 'logic' | 'formatting' | 'other';
	severity: 'error' | 'warning' | 'info';
	title: string;
	description: string;
	fixSuggestion?: string;
}

export interface EvaluationResult {
	isExactMatch: boolean;
	summary: string;
	issues: EvaluationIssue[];
	studentCodeCleaned?: string;
}

interface DeepSeekChatResponse {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
}

export async function evaluateCodeWithDeepSeek(
	referenceCode: string,
	studentCode: string,
	language: string
): Promise<EvaluationResult> {
	const apiKey = process.env.DEEPSEEK_API_KEY;

	if (!apiKey || apiKey === 'sk-your-deepseek-api-key') {
		throw new Error(
			'DEEPSEEK_API_KEY is not configured in .env. Please provide a valid DeepSeek API key.'
		);
	}

	// Clean inputs
	const refTrimmed = referenceCode.trim();
	const studTrimmed = studentCode.trim();

	if (refTrimmed === studTrimmed) {
		return {
			isExactMatch: true,
			summary: '🎉 Perfect match! The student code is completely identical to the reference code.',
			issues: []
		};
	}

	const systemPrompt = `You are an expert programming tutor assistant.
Your task is to compare a student's code against a teacher's reference code ("Right Code") and pinpoint mistakes, specifically:
1. Syntax errors
2. String or variable typos (e.g. "prnt" instead of "print", "helllo" instead of "hello")
3. Missing punctuation, brackets, quotes, indentation, colons
4. Logic or parameter differences

Keep explanations simple, concise, and friendly for coding students.
You MUST return your response ONLY as valid, raw JSON with this exact structure:
{
  "isExactMatch": false,
  "summary": "Brief 1-2 sentence overall review of how close the student code is.",
  "issues": [
    {
      "line": 3,
      "type": "typo" | "syntax" | "logic" | "formatting" | "other",
      "severity": "error" | "warning" | "info",
      "title": "Short issue title (e.g., Typo in print statement)",
      "description": "Clear explanation of what is wrong in the student's code.",
      "fixSuggestion": "The exact corrected code snippet or instruction."
    }
  ]
}
Do NOT include markdown formatting like \`\`\`json\`\`\`, just the pure JSON string.`;

	const userContent = `Programming Language: ${language}

=== REFERENCE (RIGHT) CODE ===
${referenceCode}

=== STUDENT CODE TO EVALUATE ===
${studentCode}
`;

	const response = await fetch('https://api.deepseek.com/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: 'deepseek-chat',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userContent }
			],
			temperature: 0.1,
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
	}

	const data = (await response.json()) as DeepSeekChatResponse;
	const content = data.choices?.[0]?.message?.content?.trim();

	if (!content) {
		throw new Error('DeepSeek returned an empty response.');
	}

	try {
		// Clean markdown code blocks if present
		const cleaned = content
			.replace(/^```json/i, '')
			.replace(/```$/i, '')
			.trim();
		const parsed: EvaluationResult = JSON.parse(cleaned);
		return parsed;
	} catch {
		console.error('Failed to parse DeepSeek response as JSON:', content);
		return {
			isExactMatch: false,
			summary: content,
			issues: [
				{
					type: 'other',
					severity: 'warning',
					title: 'Evaluation Note',
					description: content
				}
			]
		};
	}
}
