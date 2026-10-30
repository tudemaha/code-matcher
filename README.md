# Code Matcher

> **Code Matcher by Tude Maha**  
> A clean, distraction-free code comparison and evaluation web tool designed for coding tutors and students.

Code Matcher simplifies reviewing student code by comparing it side-by-side against a reference solution. Powered by DeepSeek AI, it pinpoints syntax errors, string typos, missing punctuation, and logic discrepancies with actionable line-by-line fix suggestions.

---

## Features

- **Side-by-Side Review**: Dual-column layout displaying the read-only reference code and the student's editable code with synchronized line counts and syntax highlighting.
- **AI-Powered Diagnostics**: DeepSeek AI analyzes differences token-by-token and provides an overall evaluation summary alongside structured line-by-line fixes.
- **48-Hour Auto-Cleanup**: Each reference code document automatically expires and is deleted after 48 hours using native MongoDB TTL (Time To Live) indexing.
- **PIN-Protected Evaluations**: Server-side PIN verification ensures AI evaluation requests are authorized before contacting the AI endpoint.
- **Clean Aesthetic**: Pastel green theme (`Google Sans Flex` + `Google Sans Code`), minimal hero layout, and clean text labels without distracting emojis or clutter.
- **Multi-Language Highlighting**: Syntax highlighting for Python, JavaScript, TypeScript, HTML, CSS, Java, C++, C, SQL, JSON, Bash, Rust, and Go via Prism.js.

---

## Tech Stack

- **Framework**: [SvelteKit](https://svelte.dev/) with Svelte 5 (Runes mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **AI Engine**: [DeepSeek AI](https://www.deepseek.com/) (`deepseek-chat`)
- **Syntax Highlighting**: [Prism.js](https://prismjs.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Deployment Adapter**: `@sveltejs/adapter-vercel`
- **Package Manager**: [Bun](https://bun.sh/)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A MongoDB connection string (MongoDB Atlas or local MongoDB instance)
- A DeepSeek API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tudemaha/code-matcher.git
   cd code-matcher
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create your `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   # MongoDB connection string (database name: code_matcher)
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/code_matcher?retryWrites=true&w=majority

   # DeepSeek AI API Key
   DEEPSEEK_API_KEY=sk-...

   # Tutor Access PIN for AI evaluations (default: 123456)
   ACCESS_PIN=123456
   ```

---

## Development

Start the local development server:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Quality Checks & Scripts

```bash
# Type-check Svelte and TypeScript files
bun run check

# Check code formatting with Prettier and lint with ESLint
bun run lint

# Format all code files
bun run format

# Build for production
bun run build

# Preview production build locally
bun run preview
```

---

## Architecture & Data Flow

### Database Collections

- **`codes`**: Stores reference codes posted by tutors.
  - `title`: Problem title or challenge name.
  - `programming_language`: Language identifier (e.g., `py`, `js`, `ts`).
  - `code`: The correct reference code string.
  - `created_at`: Creation timestamp with an automatic TTL index expiring documents after 48 hours (`expireAfterSeconds: 172800`).
- **`configs`**: Tracks application configuration and usage analytics.
  - `access_pin`: Master access PIN required for student evaluations.
  - `matcher_count`: Total reference codes created.
  - `request_count`: Total AI evaluation requests performed.
  - `last_used_at`: Timestamp of the last AI evaluation.
  - `last_created_at`: Timestamp of the last added reference code.

### Evaluation Workflow

1. Tutor adds a reference code on the main page (`/`) specifying title, language, and code.
2. Tutor shares the reference code URL (`/code/[id]`) with students.
3. Students paste their attempt into the editor.
4. Students enter the tutor-provided access PIN and click **Start Evaluation**.
5. The request is sent to `/api/evaluate`, which verifies the PIN server-side against `Config.access_pin`.
6. Upon validation, the server sends the prompt to DeepSeek AI, increments analytics counters, and returns structured fix suggestions.

---

## Security & UI Guidelines

- **PIN Security**: The access PIN is validated strictly on the server before calling the AI API. The default PIN is never exposed on client payloads or web UI.
- **Clean UI**: No top navbar on main view, minimal empty state, clean text labels without emoji icons, and no delete buttons on reference cards.
