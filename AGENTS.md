# Code Checker by Tude Maha

This project is a code checker website. It check 2 codes, the one is the right one, and the second is the code need to be evaluated. This is useful for coding student when tutor (me) finds difficulties to find the syntax and string typos. AI will be used to evaluate the both code to find the wrong part.

## Project Layout

### Main View

- Contains the list of code can be selected by students.
- There's a + button to add the new right code
- When adding a new code, I just need to enter the title, code, and the programming language of the code (syntax highlighting purpose when display the code)

### Detail View

- Grid layout
  - Left column: 1st row is the right code (reference code, disabled), 2nd row is the code pasted by student to be check the match
  - Right column: The sugesstion of fixes (evaluation), AI generated, simple explanation in a list
- A button to start the evaluation (with student need to enter my pin 123456 for default now)

## Technologies

- Framework: SvelteKit (with Svelte 5)
- Database: MongoDB
- CSS: TailwindCSS
- AI: Deepseek AI
- Code highlighting: markdown or any simple web text editor
  Example:
  ```py
  a = 1
  b = 2
  print(a + b)
  ```

## Technical

- Each code will be automatically deleted after 48 hours using a MongoDB TTL (Time To Live) index on `created_at` (expireAfterSeconds: 172800)
- Make sure to call AI on the backend
- Make sure to call DB on the backend
- Make sure PIN verification is handled securely on the backend before calling AI
- Use a simple way to connect to MongoDB, Mongoose preferred

## DB Structure

- DB Name: code_matcher
- Collections: codes, configs

### codes

- id (_id)
- title
- programming_language (py, js, etc.)
- code
- created_at (with TTL index: `expireAfterSeconds: 172800`)

### configs

This is my configuration

- access_pin (the pin to access AI evaluation for student)
- matcher_count (how many code matcher have been created)
- request_count (how many request have been sent on this project, AI evaluation related)
- last_used_at (last request)
- last_created_at (last right code added)

## Design System

- Color:
  - Primary: pastel green
  - Secondary: Up to you
  - Background: soft white
- Font:
  - Normal: Google Sans Flex
  - Monospace: Google Sans Code
