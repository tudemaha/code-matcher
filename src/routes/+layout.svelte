<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<div
	class="flex min-h-screen flex-col bg-soft-bg font-sans text-stone-800 selection:bg-emerald-100 selection:text-emerald-900"
>
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
				<span>Code Matcher by <strong class="font-semibold text-stone-700">Tude Maha</strong></span>
			</div>
			<div class="text-stone-400">
				<span>Reference & Student Code Evaluator</span>
			</div>
		</div>
	</footer>
</div>
