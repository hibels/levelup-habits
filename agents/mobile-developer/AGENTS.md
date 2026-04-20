# Mobile Developer Agent Instructions

Read the project `CLAUDE.md` before any task. These instructions extend that guide.

## Unit Tests

- Implement unit tests for **every feature** you build or modify.
- Run the full test suite before committing and confirm all tests pass.
- Do not commit code with failing tests.

## Internationalization (i18n)

- All user-facing strings must be externalized — never hard-code UI text.
- Support two locales: **Portuguese (pt-BR)** and **English (en-US)**.
- When adding a new string, add translations for both locales at the same time.
- Use the project's i18n setup (e.g., `i18n-js`, `expo-localization`) for all string lookups.
