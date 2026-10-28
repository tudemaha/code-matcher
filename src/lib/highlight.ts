import Prism from 'prismjs';

// Load commonly used language grammars
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup'; // HTML/XML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';

const languageMap: Record<string, string> = {
	py: 'python',
	python: 'python',
	js: 'javascript',
	javascript: 'javascript',
	ts: 'typescript',
	typescript: 'typescript',
	html: 'markup',
	xml: 'markup',
	css: 'css',
	c: 'c',
	cpp: 'cpp',
	'c++': 'cpp',
	java: 'java',
	sql: 'sql',
	json: 'json',
	bash: 'bash',
	sh: 'bash',
	rust: 'rust',
	rs: 'rust',
	go: 'go',
	golang: 'go'
};

export function highlightCode(code: string, language: string): string {
	if (!code) return '';

	const langKey = (language || '').toLowerCase().trim();
	const prismLang = languageMap[langKey] || 'javascript';

	const grammar = Prism.languages[prismLang] || Prism.languages.javascript;

	try {
		return Prism.highlight(code, grammar, prismLang);
	} catch (err) {
		console.warn('Prism highlighting error:', err);
		return escapeHtml(code);
	}
}

export function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export interface LanguageOption {
	id: string;
	name: string;
	icon: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
	{ id: 'py', name: 'Python', icon: '🐍' },
	{ id: 'js', name: 'JavaScript', icon: '🟨' },
	{ id: 'ts', name: 'TypeScript', icon: '🔷' },
	{ id: 'html', name: 'HTML', icon: '🌐' },
	{ id: 'css', name: 'CSS', icon: '🎨' },
	{ id: 'java', name: 'Java', icon: '☕' },
	{ id: 'cpp', name: 'C++', icon: '⚡' },
	{ id: 'c', name: 'C', icon: '🔧' },
	{ id: 'sql', name: 'SQL', icon: '🗄️' },
	{ id: 'json', name: 'JSON', icon: '📋' },
	{ id: 'bash', name: 'Bash', icon: '💻' },
	{ id: 'rust', name: 'Rust', icon: '🦀' },
	{ id: 'go', name: 'Go', icon: '🐹' }
];
