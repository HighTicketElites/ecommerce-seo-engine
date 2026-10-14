# Ecommerce SEO Engine

Canonical source for the HighTicketElites ecommerce SEO automation infrastructure.

## WattWheelz
- Draft Generator: Vercel project `wattwheelz-seo-draft-generator`
- Production branch: `main`
- Workflow: Research → Draft Generator → Shopify Draft → V4 QA → Human Approval → Publish → Live QA
- Current job: HOVSCO HovCart Review 2026

Git-backed deployment restored September 2026.

## SEO Blog Engine OS — Authentication policy

Locked October 14, 2026 by founder instruction, subject to verified implementation.

- For routine runs, prefer existing authenticated connectors or supported server-side access. Do not introduce an interactive browser sign-in detour as the default operating method.
- Before starting a run, verify the current queue and Shopify article states. Preserve published articles and avoid duplicate drafts.
- A browser login failure is evidence about that access attempt only. It does not establish that the engine or its normal authenticated access is broken.
- Do not claim that browser sign-in is never required unless an end-to-end run proves a supported non-browser path for the required stages.
- Current implementation limitation: Stage 02's deployed entry point redirects through Shopify OAuth and its callback exchanges the authorization code before invoking runDraftJob. The code reviewed on this date does not establish a persistent server-side draft-run entry point. Fresh authorization may therefore require interactive authentication. Report this dependency precisely instead of inventing a working alternative.
- If authorization is expired, revoked, or missing, identify the exact dependency and use the supported reauthorization mechanism. Never bypass authentication or weaken deployment protection.
- Preserve the controlled sequence: research → roadmap/content graph → Stage 02 draft → Shopify draft → draft QA → Stage 03 controlled publishing → human approval → publish → live QA → lock → reciprocal/internal-link pass.
- Connector-first access does not remove human publishing approval or content, product, image, link, fingerprint, and live-QA checks.
