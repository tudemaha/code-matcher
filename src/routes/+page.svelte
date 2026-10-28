<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Plus,
		Search,
		CodeXml,
		Sparkles,
		Clock,
		TriangleAlert,
		ArrowRight,
		FileCode,
		Activity,
		Trash2,
		X
	} from 'lucide-svelte';
	import { SUPPORTED_LANGUAGES, type LanguageOption } from '#lib/highlight';

	interface CodeListItem {
		id: string;
		title: string;
		programming_language: string;
		code: string;
		created_at: string;
	}

	let { data, form } = $props();

	let searchQuery = $state('');
	let selectedLanguageFilter = $state('all');
	let isModalOpen = $state(false);

	// New code form state
	let newTitle = $state('');
	let newLanguage = $state('py');
	let newCode = $state('');
	let isSubmitting = $state(false);

	// Filter codes
	const filteredCodes = $derived(
		((data.codes as CodeListItem[]) || []).filter((item: CodeListItem) => {
			const matchesSearch =
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.programming_language.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesLang =
				selectedLanguageFilter === 'all' || item.programming_language === selectedLanguageFilter;
			return matchesSearch && matchesLang;
		})
	);

	function getTimeRemaining(createdAtString: string) {
		const created = new Date(createdAtString);
		const expires = new Date(created.getTime() + 48 * 60 * 60 * 1000);
		const now = new Date();
		const diffMs = expires.getTime() - now.getTime();

		if (diffMs <= 0) return 'Expiring soon';
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		if (hours > 0) {
			return `${hours}h ${minutes}m left`;
		}
		return `${minutes}m left`;
	}

	function getLanguageLabel(codeLang: string): string {
		const found = SUPPORTED_LANGUAGES.find(
			(l: LanguageOption) => l.id === codeLang || l.name.toLowerCase() === codeLang
		);
		return found ? `${found.icon} ${found.name}` : codeLang.toUpperCase();
	}
</script>

<div class="space-y-8">
	<!-- Database Connection Warning if not connected -->
	{#if !data.dbConnected}
		<div class="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
			<div class="flex items-start gap-3">
				<TriangleAlert class="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
				<div class="space-y-1">
					<h3 class="text-sm font-semibold text-amber-900">Database Connection Required</h3>
					<p class="text-xs leading-relaxed text-amber-800">
						Cannot connect to MongoDB. Please add your MongoDB Atlas or local connection string to
						the
						<code class="rounded bg-amber-200/60 px-1.5 py-0.5 font-mono text-[11px] text-amber-950"
							>.env</code
						>
						file as
						<code class="rounded bg-amber-200/60 px-1.5 py-0.5 font-mono text-[11px] text-amber-950"
							>MONGODB_URI=...</code
						>.
					</p>
					{#if data.dbError}
						<p class="pt-1 font-mono text-[11px] break-all text-amber-700">Error: {data.dbError}</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Hero Header with Stats -->
	<div
		class="relative overflow-hidden rounded-3xl border border-emerald-100 bg-linear-to-br from-emerald-50 via-teal-50/50 to-white p-6 shadow-2xs sm:p-8"
	>
		<div
			class="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"
		></div>

		<div class="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
			<div class="max-w-2xl space-y-2">
				<div
					class="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800"
				>
					<Sparkles class="h-3.5 w-3.5 text-emerald-600" />
					<span>Instant Syntax & Typo Detection</span>
				</div>
				<h1 class="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
					Find coding mistakes & typos effortlessly.
				</h1>
				<p class="text-sm leading-relaxed text-stone-600 sm:text-base">
					Select an active reference code below to check student solutions against the tutor's model
					code. Spots exact line typos and syntax bugs in seconds.
				</p>
			</div>

			<!-- Stats Chips -->
			<div class="grid shrink-0 grid-cols-2 gap-3">
				<div
					class="min-w-32.5 rounded-2xl border border-emerald-100 bg-white/80 p-3.5 shadow-2xs backdrop-blur-sm"
				>
					<div class="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
						<CodeXml class="h-3.5 w-3.5 text-emerald-600" />
						<span>Total Codes</span>
					</div>
					<div class="font-mono text-2xl font-bold text-stone-900">
						{data.stats?.matcher_count || data.codes.length || 0}
					</div>
				</div>

				<div
					class="min-w-32.5 rounded-2xl border border-emerald-100 bg-white/80 p-3.5 shadow-2xs backdrop-blur-sm"
				>
					<div class="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
						<Activity class="h-3.5 w-3.5 text-teal-600" />
						<span>Evaluations</span>
					</div>
					<div class="font-mono text-2xl font-bold text-stone-900">
						{data.stats?.request_count || 0}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Action Bar: Search, Language Filter, and + Add Button -->
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div class="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
			<!-- Search Bar -->
			<div class="relative max-w-md flex-1">
				<Search class="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search title or language..."
					class="w-full rounded-xl border border-stone-200 bg-white py-2 pr-4 pl-10 text-sm shadow-2xs transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</div>

			<!-- Language Filter Dropdown -->
			<select
				bind:value={selectedLanguageFilter}
				class="cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-2xs transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
			>
				<option value="all">All Languages ({data.codes.length})</option>
				{#each SUPPORTED_LANGUAGES as lang (lang.id)}
					<option value={lang.id}>{lang.icon} {lang.name}</option>
				{/each}
			</select>
		</div>

		<!-- Big + Add Right Code Button -->
		<button
			onclick={() => (isModalOpen = true)}
			class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-emerald-700 hover:shadow active:scale-98"
		>
			<Plus class="h-4 w-4" />
			<span>Add Reference Code</span>
		</button>
	</div>

	<!-- Code List Section -->
	{#if filteredCodes.length === 0}
		<div class="rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
			<div
				class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600"
			>
				<FileCode class="h-7 w-7" />
			</div>
			<h3 class="mb-1 text-base font-semibold text-stone-800">
				{searchQuery || selectedLanguageFilter !== 'all'
					? 'No matching codes found'
					: 'No reference codes yet'}
			</h3>
			<p class="mx-auto mb-6 max-w-md text-xs text-stone-500">
				{searchQuery || selectedLanguageFilter !== 'all'
					? 'Try searching with another keyword or resetting the language filter.'
					: 'Add your first reference code to allow students to evaluate their solutions against it.'}
			</p>
			{#if searchQuery || selectedLanguageFilter !== 'all'}
				<button
					onclick={() => {
						searchQuery = '';
						selectedLanguageFilter = 'all';
					}}
					class="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
				>
					Clear Filters
				</button>
			{:else}
				<button
					onclick={() => (isModalOpen = true)}
					class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700"
				>
					<Plus class="h-4 w-4" />
					<span>Add First Reference Code</span>
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredCodes as item (item.id)}
				<div
					class="group flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
				>
					<div class="space-y-3 p-5">
						<!-- Header: Language & Expiration Badge -->
						<div class="flex items-center justify-between gap-2">
							<span
								class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
							>
								{getLanguageLabel(item.programming_language)}
							</span>
							<span
								class="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] text-stone-500"
							>
								<Clock class="h-3 w-3 text-emerald-600" />
								{getTimeRemaining(item.created_at)}
							</span>
						</div>

						<!-- Title -->
						<div>
							<h3
								class="line-clamp-1 text-base font-bold text-stone-900 transition-colors group-hover:text-emerald-700"
							>
								{item.title}
							</h3>
						</div>

						<!-- Code Preview Box -->
						<div
							class="relative max-h-32 overflow-hidden rounded-xl bg-stone-900/95 p-3 font-mono text-[11px] text-stone-300 select-none"
						>
							<div
								class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-stone-900 to-transparent"
							></div>
							<pre class="overflow-hidden leading-relaxed"><code>{item.code}</code></pre>
						</div>
					</div>

					<!-- Bottom Action Link -->
					<div
						class="flex items-center justify-between border-t border-stone-100 bg-stone-50/70 px-5 py-3.5"
					>
						<form
							method="POST"
							action="?/delete"
							use:enhance
							class="inline"
							onsubmit={(e) => {
								if (!confirm('Are you sure you want to delete this reference code?')) {
									e.preventDefault();
								}
							}}
						>
							<input type="hidden" name="id" value={item.id} />
							<button
								type="submit"
								class="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
								title="Delete reference code"
							>
								<Trash2 class="h-3.5 w-3.5" />
							</button>
						</form>

						<a
							href="/code/{item.id}"
							class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-all group-hover:translate-x-0.5 hover:text-emerald-800"
						>
							<span>Open Matcher</span>
							<ArrowRight class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal: Add New Reference Code -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs"
	>
		<div
			class="animate-in fade-in zoom-in-95 w-full max-w-2xl space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-xl duration-150 sm:p-7"
		>
			<div class="flex items-center justify-between border-b border-stone-100 pb-3">
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"
					>
						<CodeXml class="h-5 w-5" />
					</div>
					<div>
						<h2 class="text-lg font-bold text-stone-900">Add New Reference Code</h2>
						<p class="text-xs text-stone-500">
							This code will serve as the correct baseline and auto-delete after 48 hours.
						</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					class="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			{#if form?.error}
				<div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<!-- Title Input -->
				<div class="space-y-1.5">
					<label for="title" class="block text-xs font-semibold text-stone-700">
						Title / Exercise Name <span class="text-rose-500">*</span>
					</label>
					<input
						id="title"
						name="title"
						type="text"
						bind:value={newTitle}
						required
						placeholder="e.g. Exercise 1: Sum of Two Numbers"
						class="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm shadow-2xs transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
					/>
				</div>

				<!-- Language Selection -->
				<div class="space-y-1.5">
					<label for="programming_language" class="block text-xs font-semibold text-stone-700">
						Programming Language <span class="text-rose-500">*</span>
					</label>
					<select
						id="programming_language"
						name="programming_language"
						bind:value={newLanguage}
						required
						class="w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm shadow-2xs transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
					>
						{#each SUPPORTED_LANGUAGES as lang (lang.id)}
							<option value={lang.id}>{lang.icon} {lang.name} ({lang.id})</option>
						{/each}
					</select>
				</div>

				<!-- Code Textarea -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<label for="code" class="block text-xs font-semibold text-stone-700">
							Reference Code (Right Code) <span class="text-rose-500">*</span>
						</label>
						<span class="font-mono text-[11px] text-stone-400">Tutor code</span>
					</div>
					<textarea
						id="code"
						name="code"
						rows="8"
						bind:value={newCode}
						required
						placeholder="Paste your correct reference solution here..."
						class="w-full rounded-xl border border-stone-700 bg-stone-900 p-3 font-mono text-xs leading-relaxed text-stone-100 shadow-inner transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
					></textarea>
				</div>

				<!-- Footer Buttons -->
				<div class="flex items-center justify-end gap-3 border-t border-stone-100 pt-3">
					<button
						type="button"
						onclick={() => (isModalOpen = false)}
						class="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isSubmitting || !newTitle || !newCode}
						class="cursor-pointer rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? 'Saving...' : 'Save Reference Code'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
