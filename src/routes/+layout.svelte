<script lang="ts">
	import './layout.css';
	import { CodeXml, Clock, Plus } from 'lucide-svelte';

	let { children } = $props();
</script>

<div
	class="flex min-h-screen flex-col bg-soft-bg font-sans text-stone-800 selection:bg-emerald-100 selection:text-emerald-900"
>
	<!-- Top Navigation Bar -->
	<header
		class="sticky top-0 z-40 border-b border-stone-200/80 bg-soft-bg/90 backdrop-blur-md transition-all"
	>
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
			<!-- Logo & Title -->
			<a
				href="/"
				class="group flex items-center gap-3 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/60 bg-linear-to-br from-emerald-200 to-teal-200 text-emerald-800 shadow-xs transition-transform duration-200 group-hover:scale-105"
				>
					<CodeXml class="h-5 w-5 text-emerald-800" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<span
							class="text-lg font-bold tracking-tight text-stone-900 transition-colors group-hover:text-emerald-800"
						>
							Code Matcher
						</span>
						<span
							class="rounded-md border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase"
						>
							Checker
						</span>
					</div>
					<p class="hidden text-xs text-stone-500 sm:block">
						Compare reference & student code instantly
					</p>
				</div>
			</a>

			<!-- Right Info Badges & Action -->
			<div class="flex items-center gap-3">
				<div
					class="hidden items-center gap-2 rounded-full border border-stone-200/80 bg-white/70 px-3 py-1.5 text-xs text-stone-500 shadow-2xs md:flex"
				>
					<Clock class="h-3.5 w-3.5 text-emerald-600" />
					<span>48h auto-cleanup</span>
				</div>
				<a
					href="/#add-code"
					class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-emerald-700 hover:shadow"
				>
					<Plus class="h-4 w-4" />
					<span>New Reference</span>
				</a>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		{@render children()}
	</main>

	<!-- Minimal Footer -->
	<footer class="mt-12 border-t border-stone-200/70 bg-white/50 py-6 text-xs text-stone-500">
		<div
			class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8"
		>
			<div class="flex items-center gap-2">
				<span>Code Checker by <strong class="font-semibold text-stone-700">Tude Maha</strong></span>
				<span>•</span>
				<span>Designed for coding tutors & students</span>
			</div>
			<div class="text-stone-400">
				<span>Reference & Student Code Evaluator</span>
			</div>
		</div>
	</footer>
</div>
