# Agents Guide

This is an MIT licensed RoxyAPI template: a Vedic astrology (Jyotish) kundli app built with Next.js 16 Server Components, the `@roxyapi/sdk` TypeScript client, and the `@roxyapi/ui-react` component library. It renders a janam kundli with divisional charts, Vimshottari Dasha, dosha detection, and strength analysis, plus Ashtakoot Gun Milan matching, daily Panchang, Choghadiya and Hora, and monthly transits, all from one API key with full control over the UI and the data. You are most likely a coding agent helping someone fork and rebrand this app. More templates to fork: https://roxyapi.com/starters

## Canonical RoxyAPI references (use these, do not guess)

Prefer these live sources over memory for any RoxyAPI path, field, SDK method, or limit. They are always current.

- **Docs MCP (no API key):** connect `https://roxyapi.com/mcp/docs` (Streamable HTTP, one tool `search_docs`). Ask it for any endpoint, field, auth detail, or integration step instead of hardcoding a path. `{ "mcpServers": { "roxy-docs": { "type": "http", "url": "https://roxyapi.com/mcp/docs" } } }`
- **Agent playbook:** `https://roxyapi.com/AGENTS.md`, implementation rules for building on RoxyAPI.
- **Discovery context:** `https://roxyapi.com/llms.txt` (concise) and `https://roxyapi.com/llms-full.txt` (deep).
- **Live OpenAPI spec:** `https://roxyapi.com/api/v2/vedic-astrology/openapi.json` for every Jyotish field and example, `https://roxyapi.com/api/v2/location/openapi.json` for city search. Never invent a response field.
- **Component reference:** `node_modules/@roxyapi/ui-react/AGENTS.md` maps every endpoint to the component that renders it. Response types are exported from the same package; never redeclare one.
- **UI components page:** `https://roxyapi.com/docs/ui`. **Token contract:** `https://github.com/RoxyAPI/ui/blob/main/packages/ui/THEMING.md`, every `--roxy-*` token, its light and dark default, and what it paints.
- **Live playground:** `https://roxyapi.com/api-reference#tag/vedic-astrology`. **Sitemap:** `https://roxyapi.com/sitemap.txt`.

## Setup

- Get an API key at https://roxyapi.com/pricing
- Copy `env.example` to `.env.local` and set `ROXYAPI_KEY`. That is the only secret in the project.
- `npm install`, then `npm run dev`, then open http://localhost:3000
- `npm test` runs the vitest suite: the `unwrap`/`tryUnwrap` error-code guard, and the kundali and matching Server Actions with the SDK mocked, so it runs with no network and no real key.
- Match what CI runs, in order: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. `npm run build` needs no key: every RoxyAPI call happens at request time inside a Server Component or Server Action, never at build time.

## How data flows

- `src/lib/roxy/client.ts` is the one server-only SDK client, guarded by the `server-only` import so any client-side import of it is a build error rather than a leak. `hasApiKey` tells a page boundary whether to render `ApiKeyMissing` instead of calling the API.
- `src/lib/roxy/guard.ts` exports `unwrap` (throws a code-mapped message) and `tryUnwrap` (returns a typed data-or-error result for branching in JSX). Every Server Component and Server Action calls one of these; never call a `roxy.*` method directly and swallow the error.
- Read pages fetch inside the Server Component: `src/app/page.tsx` (Panchang), `src/app/choghadiya/page.tsx`, `src/app/transits/page.tsx`. The two form flows submit through a Server Action: `src/app/kundali/actions.ts`, `src/app/matching/actions.ts`.
- The unwrapped response is passed straight into a `@roxyapi/ui-react` component. Roxy UI components mount custom elements, so any file that imports one is a `"use client"` boundary: the small wrappers in `src/components/roxy/` (Panchang, Choghadiya) and the two page-local client files `src/app/kundali/kundali-client.tsx` and `src/app/matching/matching-client.tsx`. Two views have no Roxy component and are bespoke: `src/components/hora-table.tsx` and `src/components/transits-view.tsx`.
- `src/app/api/cities/route.ts` proxies city search server-side so the key never reaches the browser; `src/components/city-search.tsx` is the client autocomplete that calls it.
- Language is a cookie, not a provider: `src/lib/lang.server.ts` reads it in a Server Component, `src/components/language-switcher.tsx` writes it through a Server Action and refreshes the route, and i18n-aware calls forward it as a `lang` query.

## Endpoints called

Every method below is confirmed live against the OpenAPI spec by operation ID. Verify any new call the same way, never from memory.

| SDK method | Operation | Called in |
|---|---|---|
| `roxy.location.searchCities` | `GET /search` | `src/app/api/cities/route.ts` |
| `roxy.vedicAstrology.generateBirthChart` | `POST /birth-chart` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.generateDivisionalChart` | `POST /divisional-chart` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.getMajorDashas` | `POST /dasha/major` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.checkManglikDosha` | `POST /dosha/manglik` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.checkKalsarpaDosha` | `POST /dosha/kalsarpa` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.checkSadhesati` | `POST /dosha/sadhesati` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.calculateAshtakavarga` | `POST /ashtakavarga` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.calculateShadbala` | `POST /shadbala` | `src/app/kundali/actions.ts` |
| `roxy.vedicAstrology.calculateGunMilan` | `POST /compatibility` | `src/app/matching/actions.ts` |
| `roxy.vedicAstrology.getDetailedPanchang` | `POST /panchang/detailed` | `src/app/page.tsx` |
| `roxy.vedicAstrology.getChoghadiya` | `POST /panchang/choghadiya` | `src/app/choghadiya/page.tsx` |
| `roxy.vedicAstrology.getHora` | `POST /panchang/hora` | `src/app/choghadiya/page.tsx` |
| `roxy.vedicAstrology.getMonthlyTransits` | `POST /transit/monthly` | `src/app/transits/page.tsx` |
| `roxy.vedicAstrology.getMonthlyAspects` | `POST /aspects/monthly` | `src/app/transits/page.tsx` |

## Rule: location first, charts second

Every chart and panchang endpoint needs `latitude` and `longitude`, and every chart endpoint also needs `timezone`. Never ask a visitor to type any of them. `src/components/city-search.tsx` resolves a birthplace through `/api/cities`, and the selected city carries coordinates and offset into the request body. `src/lib/location.ts` holds the `Coords` type, the default city, and the search-param parsing shared by every page.

## Where to extend

- `src/app/kundali/actions.ts`: `generateKundali` fans out one birth input to eight endpoints in parallel (birth chart, D9 navamsa, major dashas, three doshas, two strength analyses); `fetchDivisionalChart` loads any other varga on demand.
- `src/app/matching/actions.ts`: `calculateMatch` runs Gun Milan for two people.
- `src/app/transits/page.tsx`, `src/app/choghadiya/page.tsx`, `src/app/page.tsx`: the three read-only Server Component pages. Add a new read endpoint by adding a page in the same shape: `tryUnwrap`, then a Roxy UI component or a bespoke view.
- `src/lib/roxy/guard.ts`: the error-code-to-message map. Add a case here when the SDK error table gains a code, not inline at a call site.
- `src/app/globals.css`: the `html:root` `--roxy-*` token bridge to the shadcn tokens. Retheme the whole app here; never restyle a Roxy component by hand.

## Conventions

- No apostrophes, no em dashes, and no double hyphens as a dash, in any prose a visitor or a reader of this repository will see.
- Never name or claim the calculation engine is open source. The public framing is "Roxy Ephemeris", verified against NASA JPL Horizons.
- Server Components by default. `"use client"` only where a Roxy UI component mounts, a form needs state, or the browser needs an event handler.
- Reuse before you add. Check `src/lib/` and `src/components/` before writing a helper or a component that probably already exists.
- `next dev` never writes into this file: `agentRules: false` in `next.config.ts` turns off the managed block Next.js writes into `AGENTS.md` when it detects a coding agent, and the `agent-rules-guard` pre-commit command in `lefthook.yml` refuses a commit if that block reappears. This repo owns its own agent instructions.

## Staying in sync with upstream

This repo is a template. Keep pulling upstream improvements (new Jyotish endpoints, dependency bumps) without losing your own customizations.

```bash
git remote add upstream https://github.com/RoxyAPI/jyotish-vedic-astrology-app.git  # one time
git fetch upstream
git merge upstream/main        # or: git rebase upstream/main
```

- Dependabot opens a weekly grouped pull request for minor and patch npm bumps, plus a separate weekly check for GitHub Actions bumps. `.github/workflows/dependabot-auto-merge.yml` approves and merges it once CI passes. TypeScript, ESLint, and `@types/node` major bumps stay manual; see `.github/dependabot.yml` for why each is held back.
- After merging, run `npm install` and `npm test`.

## Resources

- TypeScript SDK: https://github.com/RoxyAPI/sdk-typescript (npm `@roxyapi/sdk`)
- Vedic Astrology API: https://roxyapi.com/products/vedic-astrology-api · Methodology: https://roxyapi.com/methodology · More templates: https://roxyapi.com/starters · Pricing: https://roxyapi.com/pricing
