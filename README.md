# Ecommerce SEO Engine

Canonical source for the HighTicketElites ecommerce SEO automation infrastructure.

## WattWheelz
- Draft Generator: Vercel project `wattwheelz-seo-draft-generator`
- Production branch: `main`
- Workflow: Research → Draft Generator → Shopify Draft → V4 QA → Human Approval → Publish → Live QA
- Current job: EUNORAU S1000 review — Shopify draft QA passed October 14, 2026; awaiting human publishing approval

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

## Verified non-browser draft execution — October 14, 2026

Use the connector account labeled **HighTicketElites Shopify** for Watt Wheelz. Its verified link ID is `link_6ab189d935c48191b65335301e02b6bd`. Confirm `get_shop_info` returns Watt Wheelz / wattwheelz.com before mutations. Do not confuse this with the separate `mcp__shopify` connection; that separate connection returned Authentication required during this run.

This connector successfully performed live article reads, unpublished article creation, updates and readback without browser sign-in. Draft work follows this verified path: inspect roadmap and content graph → reconcile Shopify article states → research current product sources → prepare article → discover/validate Admin schema → create or update unpublished draft → read back → run the Stage 03 draft-QA checks → persist body, manifest and run evidence → await human publication approval. Preserve published articles and do not restart a completed batch.

The deployed OAuth UI is a separate access route, not a prerequisite for connector-based draft execution. Fully non-browser Stage 03 publication execution has not yet been verified; keep human approval and existing publication safeguards intact.

Current review package: `ww-stage03/data/manifests/eunorau-s1000-review-2026.json`; Shopify draft `gid://shopify/Article/595700482234`. All 18 draft checks passed: 1,722 words, 16 H2 sections, 10 FAQs, 4 inline images, seven live internal destinations, 1500 × 844 supplier lifestyle cover and exact SEO metadata. Publication has not been authorized or executed. Reciprocal links are deferred until publication.
