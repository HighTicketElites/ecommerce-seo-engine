# Ecommerce SEO Engine

Canonical source for the HighTicketElites ecommerce SEO automation infrastructure.

## WattWheelz
- Draft Generator: Vercel project `wattwheelz-seo-draft-generator`
- Production branch: `main`
- Workflow: Research → Draft Generator → Shopify Draft → V4 QA → Human Approval → Publish → Live QA
- Last completed new-article job: Best E-Bikes for Hills in 2026 — published, live QA passed and reciprocal links verified October 26, 2026.
- Next roadmap topic: Best Long-Range E-Bikes of 2026.

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

The deployed OAuth UI is a separate access route, not a prerequisite for connector-based draft execution. The connector-based controlled publication procedure was verified on October 14, 2026: user approval, exact body/identity and fingerprint checks, active products, draft QA, publication audit metafields, live QA, rollback on initial QA failure, corrected title-entity parsing, republish, live QA pass and manifest lock. The deployed OAuth UI remains a separate route. Preserve these safeguards on connector runs.

Current review package: `ww-stage03/data/manifests/eunorau-s1000-review-2026.json`; Shopify draft `gid://shopify/Article/595700482234`. All 18 draft checks passed: 1,722 words, 16 H2 sections, 10 FAQs, 4 inline images, seven live internal destinations, 1500 × 844 supplier lifestyle cover and exact SEO metadata. Publication was approved in conversation and executed through the connector. Live QA passed, the manifest is locked, and reciprocal links were added to the EUNORAU and heavy-rider guides.

## Review handoff — current operating procedure

- Give the user the established Stage 03 review URL: https://wattwheelz-shopify-content-ops.vercel.app/?job=JOB_ID.
- Before calling a draft ready for review, register its exact Shopify body, metadata, cover and fingerprint in Stage 03, validate its manifest, deploy the intended publishing project, and verify that this specific job is selected with its full preview visible.
- The review-ready manifest values used by Stage 03 are `draft_readiness: approved` and `publish_readiness: pilot_approved`. These enable final checks and the human approval step; they do not publish the article.
- Confirm published article states against Shopify and keep completed jobs locked and out of the approval selector. Unknown or completed job links must never silently select another article.
- The final approval page displays the exact Shopify draft. It preserves OAuth, product-status checks, draft QA, content fingerprints, expiring nonce-based approval and automatic rollback after critical live-QA failure.
- Persist source files and QA evidence in this repository. Complete the user-facing review handoff through the existing publishing interface.
