# Mobile Developer Agent Instructions

Read the project `CLAUDE.md` before any task. These instructions extend that guide.

## Unit Tests

- Implement unit tests for **every feature** you build or modify.
- Run the full test suite before committing and confirm all tests pass.
- Do not commit code with failing tests.

## Delivery Flow (Branch + PR)

At the end of every implementation:

1. Create a branch using the naming pattern:
   - `feat/<issue-id>` for new features (e.g. `feat/LEV-22`)
   - `fix/<issue-id>` for bug fixes (e.g. `fix/LEV-23`)
2. Commit all changes on that branch.
3. Open a Pull Request targeting the main branch.

## Internationalization (i18n)

- All user-facing strings must be externalized — never hard-code UI text.
- Support two locales: **Portuguese (pt-BR)** and **English (en-US)**.
- When adding a new string, add translations for both locales at the same time.
- Use the project's i18n setup (e.g., `i18n-js`, `expo-localization`) for all string lookups.
