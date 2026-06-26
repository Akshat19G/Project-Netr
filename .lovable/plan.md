# Complete multilingual implementation

Goal: every visible UI string in Project Netr changes instantly when language changes — across all 12 supported languages — with the Language screen as the first experience and the choice persisted.

## 1. Single source-of-truth English catalog
Replace `src/i18n/locales/en.ts` with a comprehensive nested catalog covering every page, component, toast, label, placeholder, error, and personas/categories/program-category labels.

Namespaces:
- `nav`, `brand`, `common`, `language`, `home`, `onboarding`, `personas`, `categories`, `programCats`, `dashboard`, `opportunities`, `scholarships`, `schemes`, `ai`, `documents`, `settings`, `about`, `card`, `errors`, `toast`, `suggested`, `empty`.

Arrays for state/age/education/income options become arrays in the catalog so onboarding renders translated values.

## 2. Bulk auto-translate to 11 other languages
Use `/tmp/lovable_ai.py` with `google/gemini-3-flash-preview` to translate the English JSON to: hi, mr, ta, te, kn, ml, gu, pa, bn, or, ur — one model call per language returning the same nested JSON with translated values. Brand names ("Project Netr", "PM-KISAN", "Ayushman Bharat", URLs, "Aadhaar") are kept verbatim in the prompt.

Output 12 files in `src/i18n/locales/{code}.ts`. Wire them all into `src/i18n/index.ts` (replace the empty stubs).

## 3. Refactor every UI surface to read from i18n
- `TopNav`, `AppShell` footer
- `routes/index.tsx` (Hero, WhyNetr, CategoriesSection, HowItWorks, PrivacySection, ClosingCTA, Footer)
- `routes/onboarding.tsx` (all 6 steps + state/age/education/income/persona arrays + buttons)
- `routes/dashboard.tsx` (hero, quick actions, sections, bookmarks empty state, suggested questions)
- `routes/opportunities.tsx`, `scholarships.tsx`, `schemes.tsx` (headers, search placeholders, category chips via `programCats`, sort, empty states, pagination)
- `routes/ai-assistant.tsx` (header, empty state, placeholder, thinking, suggested, errors, copy/regenerate)
- `routes/documents.tsx` (drop zone, categories, vault notice, empty, preview, toasts)
- `routes/settings.tsx` (every group title/description, theme labels, accessibility, privacy, region, AI, clear-all)
- `routes/about.tsx` (all copy + developer credit, "Akshat Srivastava" kept verbatim)
- `routes/language.tsx` already wired
- `routes/__root.tsx` 404 + error component
- `OpportunityCard` (category chip, Benefit/Window labels, Show/Hide details, Learn more, Apply, Source, bookmark toasts)
- `EmptyState` (no string changes — already prop-driven)

Convert `personas`/`categories` in `src/lib/netr-data.ts` to expose only IDs/icons; consumers render names/descriptions via `t("personas.<id>.title")`. Convert `PROGRAM_CATEGORY_LABEL` consumers to call `t("programCats.<id>")` (keep the constant for fallback / non-React contexts).

Convert `suggestedQuestions` to an array key consumed via `t("suggested", { returnObjects: true })`.

All toast strings move to `toast.*` keys.

## 4. Persistence & instant switching
Existing `src/i18n/index.ts` already persists choice in `localStorage` (`netr.lang.v1`) and the root redirects to `/language` until chosen — no changes needed. `setLanguage` calls `i18n.changeLanguage` which re-renders every `useTranslation` consumer instantly with no navigation.

## 5. AI request language
`ai-assistant.tsx` already sends `language` in the body and the chat API instructs Gemini to respond in that language — no changes needed.

## Technical notes
- All string lookups use `useTranslation()`; nothing reads from the locale module directly.
- Arrays (suggested questions, persona ordering, state list, etc.) come from `t(key, { returnObjects: true }) as string[]`.
- Brand: "Project Netr" stays in original Latin script across all languages (keeps the orange/blue logo lockup intact).
- Native language names stay native (already in `SUPPORTED_LANGUAGES`).
- Translation files are TypeScript `as const` exports; the `Translation` type continues to come from `en.ts` for type-safe key access.

## Out of scope (intentionally English)
- Program titles/descriptions in `src/data/programs.ts` — these are official Indian government scheme names; localizing them risks misrepresentation. UI chrome around them is fully translated.
- Official URLs.
