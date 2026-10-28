<script lang="ts">
	import {
		ArrowLeft,
		Copy,
		Check,
		Sparkles,
		Clock,
		KeyRound,
		CircleAlert,
		CircleCheck,
		TriangleAlert,
		Info,
		Terminal,
		CheckCheck
	} from 'lucide-svelte';
	import { highlightCode, SUPPORTED_LANGUAGES, type LanguageOption } from '#lib/highlight';
	import type { EvaluationResult } from '#lib/server/ai';

	let { data } = $props();

	// Student code input
	let studentCode = $state('');
	let pin = $state('');

	// AI evaluation state
	let isEvaluating = $state(false);
	let evaluationResult = $state<EvaluationResult | null>(null);
	let errorMessage = $state<string | null>(null);

	// UI helpers
	let copiedRef = $state(false);
	let copiedStudent = $state(false);

	// Line counts
	const refLines = $derived(data.code.code.split('\n'));
	const studentLines = $derived(studentCode.split('\n'));

	// Syntax highlighted HTML for reference code
	const highlightedReferenceCode = $derived(
		highlightCode(data.code.code, data.code.programming_language)
	);

	function copyToClipboard(text: string, type: 'ref' | 'student') {
		navigator.clipboard.writeText(text);
		if (type === 'ref') {
			copiedRef = true;
			setTimeout(() => (copiedRef = false), 2000);
		} else {
			copiedStudent = true;
			setTimeout(() => (copiedStudent = false), 2000);
		}
	}

	async function runEvaluation() {
		if (!studentCode.trim()) {
			errorMessage = 'Please paste or type the student code first before evaluating.';
			return;
		}

		if (!pin.trim()) {
			errorMessage = 'Please enter the access PIN.';
			return;
		}

		isEvaluating = true;
		errorMessage = null;
		evaluationResult = null;

		try {
			const res = await fetch('/api/evaluate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					codeId: data.code.id,
					studentCode: studentCode,
					pin: pin.trim()
				})
			});

			const json = await res.json();

			if (!res.ok || !json.success) {
				errorMessage =
					json.error || 'Failed to evaluate code. Please check your PIN and try again.';
			} else {
				evaluationResult = json.result;
			}
		} catch (err: unknown) {
			console.error('Evaluation request error:', err);
			const errStr =
				err instanceof Error
					? err.message
					: 'Network error occurred while calling evaluation service.';
			errorMessage = errStr;
		} finally {
			isEvaluating = false;
		}
	}

	function getTimeRemaining(expiresAtString: string) {
		const expires = new Date(expiresAtString);
		const now = new Date();
		const diffMs = expires.getTime() - now.getTime();

		if (diffMs <= 0) return 'Expired';
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m remaining`;
	}

	function getLanguageLabel(codeLang: string): string {
		const found = SUPPORTED_LANGUAGES.find(
			(l: LanguageOption) => l.id === codeLang || l.name.toLowerCase() === codeLang
		);
		return found ? found.name : codeLang.toUpperCase();
	}
</script>

<div class="space-y-6">
	<!-- Top Navigation / Title Bar -->
	<div
		class="flex flex-col justify-between gap-4 border-b border-stone-200 pb-2 sm:flex-row sm:items-center"
	>
		<div class="space-y-1">
			<a
				href="/"
				class="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition-colors hover:text-emerald-700"
			>
				<ArrowLeft class="h-3.5 w-3.5" />
				<span>Back to All Codes</span>
			</a>
			<div class="flex flex-wrap items-center gap-2.5 pt-1">
				<h1 class="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
					{data.code.title}
				</h1>
				<span
					class="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
				>
					{getLanguageLabel(data.code.programming_language)}
				</span>
			</div>
		</div>

		<!-- Expiration & Info -->
		<div
			class="flex items-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 shadow-2xs sm:self-auto"
		>
			<Clock class="h-3.5 w-3.5 text-emerald-600" />
			<span>{getTimeRemaining(data.code.expires_at)}</span>
		</div>
	</div>

	<!-- Main 2-Column Grid Layout -->
	<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
		<!-- Left Column: Row 1 (Reference Code) & Row 2 (Student Code) [7 cols on lg] -->
		<div class="space-y-6 lg:col-span-7">
			<!-- ROW 1: Right Code (Reference Code, Disabled / Read-Only) -->
			<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs">
				<div
					class="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3"
				>
					<div class="flex items-center gap-2">
						<span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
						<h2 class="text-xs font-bold tracking-wider text-stone-700 uppercase">
							1. Reference Code
						</h2>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-mono text-[11px] text-stone-400">{refLines.length} lines</span>
						<button
							onclick={() => copyToClipboard(data.code.code, 'ref')}
							class="inline-flex cursor-pointer items-center gap-1 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
						>
							{#if copiedRef}
								<Check class="h-3 w-3 text-emerald-600" />
								<span>Copied</span>
							{:else}
								<Copy class="h-3 w-3" />
								<span>Copy</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Code Box (Disabled / Read-only with line numbers) -->
				<div
					class="max-h-65 overflow-x-auto bg-stone-900 p-4 font-mono text-xs text-stone-100 select-text"
				>
					<div class="flex">
						<!-- Line Numbers -->
						<div
							class="space-y-0.5 border-r border-stone-800 pr-4 text-right text-stone-500 select-none"
						>
							{#each refLines, i (i)}
								<div>{i + 1}</div>
							{/each}
						</div>
						<!-- Code Content -->
						<pre class="flex-1 pl-4 font-mono leading-relaxed whitespace-pre"><code
								>{@html highlightedReferenceCode}</code
							></pre>
					</div>
				</div>
			</div>

			<!-- ROW 2: Code Pasted by Student -->
			<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs">
				<div
					class="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3"
				>
					<div class="flex items-center gap-2">
						<span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
						<h2 class="text-xs font-bold tracking-wider text-stone-700 uppercase">
							2. Student Code to Check
						</h2>
					</div>
					<div class="flex items-center gap-2">
						{#if studentCode}
							<button
								type="button"
								onclick={() => copyToClipboard(studentCode, 'student')}
								class="inline-flex cursor-pointer items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
							>
								{#if copiedStudent}
									<Check class="h-3 w-3 text-emerald-600" />
									<span>Copied</span>
								{:else}
									<Copy class="h-3 w-3" />
									<span>Copy</span>
								{/if}
							</button>
							<button
								type="button"
								onclick={() => (studentCode = '')}
								class="cursor-pointer rounded px-2 py-0.5 text-[11px] font-medium text-stone-500 transition-colors hover:text-rose-600"
							>
								Clear
							</button>
						{/if}
						<span class="font-mono text-[11px] text-stone-400">{studentLines.length} lines</span>
					</div>
				</div>

				<!-- Editable Code Textarea -->
				<div class="bg-stone-950 p-3">
					<textarea
						bind:value={studentCode}
						rows="10"
						placeholder="Paste student code here to find errors, typos, and mismatches..."
						class="w-full resize-y border-0 bg-stone-950 p-2 font-mono text-xs leading-relaxed text-stone-100 selection:bg-emerald-900 selection:text-emerald-100 placeholder:text-stone-600 focus:ring-0 focus:outline-none"
					></textarea>
				</div>
			</div>

			<!-- Action & PIN Row -->
			<div
				class="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center"
			>
				<!-- Access PIN Field -->
				<div class="flex items-center gap-2">
					<div class="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-stone-700">
						<KeyRound class="h-4 w-4 text-emerald-600" />
						<span>PIN:</span>
					</div>
					<input
						type="password"
						bind:value={pin}
						placeholder="Enter PIN"
						maxlength="16"
						class="w-28 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
					/>
				</div>

				<!-- Start Evaluation Button -->
				<button
					onclick={runEvaluation}
					disabled={isEvaluating || !studentCode.trim()}
					class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 hover:shadow active:scale-99 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isEvaluating}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></div>
						<span>Analyzing Code...</span>
					{:else}
						<Sparkles class="h-4 w-4" />
						<span>Start Evaluation</span>
					{/if}
				</button>
			</div>

			{#if errorMessage}
				<div
					class="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
				>
					<CircleAlert class="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
					<div>{errorMessage}</div>
				</div>
			{/if}
		</div>

		<!-- Right Column: Suggestions of Fixes [5 cols on lg] -->
		<div class="space-y-4 lg:col-span-5">
			<div class="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
				<div class="flex items-center justify-between border-b border-stone-100 pb-3">
					<div class="flex items-center gap-2">
						<Sparkles class="h-4 w-4 text-emerald-600" />
						<h2 class="text-xs font-bold tracking-wider text-stone-800 uppercase">
							Evaluation & Fix Suggestions
						</h2>
					</div>
					<span
						class="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 uppercase"
					>
						Automated Evaluation
					</span>
				</div>

				<!-- Loading Skeleton State -->
				{#if isEvaluating}
					<div class="space-y-4 py-8 text-center">
						<div
							class="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
						>
							<Sparkles class="h-6 w-6 animate-spin text-emerald-600" />
						</div>
						<div class="space-y-1">
							<h4 class="text-sm font-semibold text-stone-800">Comparing with Reference Code...</h4>
							<p class="mx-auto max-w-xs text-xs text-stone-500">
								Inspecting syntax, typos, missing symbols, and logic discrepancies.
							</p>
						</div>
					</div>

					<!-- Evaluation Results Available -->
				{:else if evaluationResult}
					<!-- Summary Header -->
					{#if evaluationResult.isExactMatch}
						<div
							class="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
						>
							<div class="flex items-center gap-2 text-sm font-bold">
								<CheckCheck class="h-4 w-4 text-emerald-600" />
								<span>Exact Match!</span>
							</div>
							<p class="text-xs leading-relaxed text-emerald-800">
								{evaluationResult.summary}
							</p>
						</div>
					{:else}
						<div class="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-4">
							<div class="flex items-center gap-1.5 text-xs font-bold text-stone-800">
								<Info class="h-3.5 w-3.5 text-emerald-600" />
								<span>Tutor Summary:</span>
							</div>
							<p class="text-xs leading-relaxed text-stone-600">
								{evaluationResult.summary}
							</p>
						</div>
					{/if}

					<!-- Issues & Fixes List -->
					<div class="space-y-3 pt-1">
						{#if evaluationResult.issues && evaluationResult.issues.length > 0}
							<div class="flex items-center justify-between text-xs font-bold text-stone-700">
								<span>Identified Issues ({evaluationResult.issues.length})</span>
								<span class="text-[11px] font-normal text-stone-400">Line-by-line fixes</span>
							</div>

							<div class="space-y-3">
								{#each evaluationResult.issues as issue, idx (idx)}
									<div
										class="space-y-2 rounded-xl border p-3.5 text-xs transition-all {issue.severity ===
										'error'
											? 'border-rose-200 bg-rose-50/50'
											: issue.severity === 'warning'
												? 'border-amber-200 bg-amber-50/50'
												: 'border-emerald-200 bg-emerald-50/50'}"
									>
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-1.5 font-bold text-stone-900">
												{#if issue.severity === 'error'}
													<CircleAlert class="h-3.5 w-3.5 shrink-0 text-rose-600" />
												{:else if issue.severity === 'warning'}
													<TriangleAlert class="h-3.5 w-3.5 shrink-0 text-amber-600" />
												{:else}
													<CircleCheck class="h-3.5 w-3.5 shrink-0 text-emerald-600" />
												{/if}
												<span class="line-clamp-1">{issue.title}</span>
											</div>

											<div class="flex shrink-0 items-center gap-1.5">
												{#if issue.line !== undefined && issue.line !== null}
													<span
														class="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-stone-700"
													>
														Line {issue.line}
													</span>
												{/if}
												<span
													class="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase {issue.type ===
													'typo'
														? 'bg-purple-100 text-purple-700'
														: issue.type === 'syntax'
															? 'bg-rose-100 text-rose-700'
															: 'bg-stone-200 text-stone-700'}"
												>
													{issue.type}
												</span>
											</div>
										</div>

										<!-- Description -->
										<p class="text-[11px] leading-relaxed text-stone-700">
											{issue.description}
										</p>

										<!-- Suggested Fix Snippet -->
										{#if issue.fixSuggestion}
											<div class="mt-2 border-t border-stone-200/60 pt-2">
												<div
													class="mb-1 text-[10px] font-semibold tracking-wider text-stone-500 uppercase"
												>
													Suggested Fix:
												</div>
												<div
													class="overflow-x-auto rounded-lg bg-stone-900 p-2 font-mono text-[11px] leading-relaxed text-emerald-300"
												>
													<code>{issue.fixSuggestion}</code>
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else if !evaluationResult.isExactMatch}
							<p class="py-4 text-center text-xs text-stone-500 italic">
								No specific line issues detected. Check spacing or indentation.
							</p>
						{/if}
					</div>

					<!-- Empty State before evaluating -->
				{:else}
					<div class="space-y-3 py-10 text-center">
						<div
							class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"
						>
							<Terminal class="h-6 w-6" />
						</div>
						<div class="space-y-1">
							<h4 class="text-xs font-semibold text-stone-700">Awaiting Evaluation</h4>
							<p class="mx-auto max-w-xs text-xs text-stone-400">
								Paste the student's solution in box #2 and click <strong>Start Evaluation</strong> to
								generate the fix list.
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
