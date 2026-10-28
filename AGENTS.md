# Code Checker by Tude Maha

This project is a code checker website. It checks two codes: the reference (right) code and the student code to be evaluated. This is useful for coding students when tutor (me) finds difficulties to find syntax and string typos. AI evaluates both codes to pinpoint the wrong parts and suggest fixes.

## Project Layout

### Main View

- Contains the list of reference codes that can be selected by students.
- Search input and language filter pills.
- A `+` button to add a new reference code (opens a modal).
- When adding a new code, tutor enters title, code, and programming language.
- Clean UI rules for Main View:
  - No top navbar.
  - No eyebrow text on the hero section.
  - Minimal empty state: simply display that there is no reference code yet ("No reference code yet.").
  - Clean programming language labels: no emoji icons and no language IDs (e.g. show `Python`, `JavaScript`, never `🐍` or `py`, `js`).
  - Do NOT show or include any delete button on reference code cards.

### Detail View

- Grid layout:
  - Left column:
    - 1st row: Reference code (read-only, disabled, syntax highlighted with line numbers).
    - 2nd row: Student code editor (editable textarea with line numbers, line counts, copy/clear actions).
    - Evaluation action bar: PIN input (`type="password"`, `placeholder="Enter PIN"`) and "Start Evaluation" button.
  - Right column: Fix suggestions and evaluation (AI-generated summary and structured line-by-line fixes).
- PIN security rule:
  - **DO NOT show the default PIN (123456) ANYWHERE on the website or client payloads.**

## Technologies

- Framework: SvelteKit (with Svelte 5 runes mode)
- Database: MongoDB (via Mongoose)
- CSS: TailwindCSS v4
- AI: DeepSeek AI (`deepseek-chat`)
- Code highlighting: Prism.js with clean line numbers and token styling
- Icons: Lucide Svelte (using current icon naming: `Sparkles`, `TriangleAlert`, `CircleAlert`, `CircleCheck`, etc.)

## Technical

- Each code is automatically deleted after 48 hours using a MongoDB TTL (Time To Live) index on `created_at` (`expireAfterSeconds: 172800`).
- Database and collections (`codes`, `configs`) are auto-created by MongoDB upon first write.
- All AI calls are executed server-side via `/api/evaluate`.
- All database operations are executed server-side.
- PIN verification is strictly enforced on the backend before invoking the AI API.
- Environment variables are defined via SvelteKit `src/env.ts` (`defineEnvVars`) and imported through `$app/env/private`:
  - `MONGODB_URI`: Connection string to MongoDB (Atlas or local).
  - `DEEPSEEK_API_KEY`: API key for DeepSeek.
  - `ACCESS_PIN`: Access PIN for evaluation (default: `123456`).

## DB Structure

- DB Name: `code_matcher`
- Collections: `codes`, `configs`

### codes

- `_id`
- `title`
- `programming_language` (e.g. `py`, `js`, `ts`, `html`, `css`, `java`, `cpp`, `c`, `sql`, `json`, `bash`, `rust`, `go`)
- `code`
- `created_at` (with TTL index: `expireAfterSeconds: 172800`)

### configs

Configuration and analytics:

- `access_pin` (PIN required to access AI evaluation)
- `matcher_count` (total number of reference codes created)
- `request_count` (total number of AI evaluation requests executed)
- `last_used_at` (timestamp of last AI evaluation)
- `last_created_at` (timestamp of last reference code added)

## Design System

- Color:
  - Primary: Pastel green (`emerald-50`, `emerald-100`, `emerald-600`, `emerald-700`)
  - Accent / Favicon: Sparkles icon with green accent on soft pastel green squircle background
  - Background: Soft white (`#FAFBF9`)
- Font:
  - Normal: Google Sans Flex
  - Monospace: Google Sans Code
- Cleanliness:
  - No emojis on language tags, badges, or selectors
  - No tech stack or AI vendor branding in user-facing tips or footers
