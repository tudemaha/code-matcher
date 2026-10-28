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
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
	{ id: 'py', name: 'Python' },
	{ id: 'js', name: 'JavaScript' },
	{ id: 'ts', name: 'TypeScript' },
	{ id: 'html', name: 'HTML' },
	{ id: 'css', name: 'CSS' },
	{ id: 'java', name: 'Java' },
	{ id: 'cpp', name: 'C++' },
	{ id: 'c', name: 'C' },
	{ id: 'sql', name: 'SQL' },
	{ id: 'json', name: 'JSON' },
	{ id: 'bash', name: 'Bash' },
	{ id: 'rust', name: 'Rust' },
	{ id: 'go', name: 'Go' }
];
