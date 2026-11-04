# WattWheelz PMax SEO Phase 2 — post-publication linking handoff (2026-11-04)

**Status:** three Stage 02 drafts + cover QA passed. Stage 03 production deployment and three individual final-approval links verified live. No Phase 2 article is currently published. This file is a plan, not a claim of applied edits.

## Exact URLs after Stage 03 approval
- Folding pillar: https://wattwheelz.com/blogs/e-bike-buying-guides/best-folding-ebikes-2026
- Rattan vs Mooncool: https://wattwheelz.com/blogs/e-bike-reviews-comparisons/rattan-lm-ultra-vs-mooncool-pop-folding-ebike
- G300 Pro vs Nova 5: https://wattwheelz.com/blogs/e-bike-reviews-comparisons/happyrun-g300-pro-vs-freego-nova5-electric-dirt-bike

## Preconditions for any Shopify edit
1. Verify Stage 03 publication_succeeded / live QA for the corresponding article, not merely an existing draft.
2. Re-fetch the current Shopify collection/product/article HTML immediately before modifying.
3. Never overwrite main CRO merchandising content, unrelated HTML, cart/variant information, or existing conversion widgets.
4. Replace/upsert the existing compact 'Need help choosing?' or data-ww-seo-education paragraph. Do not append a duplicate educational panel; links should be plain, visible, accessible anchors. Keep at most ~3–4 short links per collection and 1–2 per PDP.
5. Confirm only intended fields changed; preserve the article's canonical URL, title, tags, metadata and existing hero.
6. Avoid editing Phase 1 articles with a Stage 03 publication fingerprint except through an explicitly reviewed refresh procedure, so previous approval fingerprints are not silently invalidated.

## Collection destinations
### Adult electric dirt bikes
Shopify collection gid://shopify/Collection/492725862586
URL https://wattwheelz.com/collections/adult-electric-dirt-bike-picks
Currently has educational links to the live electric-dirt-bike buying guide, G300 Pro / X2 Pro / Falcon Pro comparison and 60V versus 72V comparison.
After G300 Pro vs Nova 5 publishes, keep the original short collection description and update the 'Need help choosing?' paragraph to a short three- or four-link set: dirt-bike guide, three-way comparison, new G300 Pro vs Nova 5 comparison, optionally 60V vs 72V if it remains uncluttered.

### Folding electric bikes
Shopify collection gid://shopify/Collection/492620382394
URL https://wattwheelz.com/collections/folding-e-bike-shortlist-for-apartments-rvs
Currently has links to the apartments/RV guide, three-Urtopia comparison and folded-fit checklist.
After the new general buying guide publishes, use the short three-to-four-link set: best folding e-bikes 2026, apartment/RV buying guide, storage-fit checklist, optional three-Urtopia comparison. The Rattan/Mooncool comparison is best placed on the relevant PDPs because Mooncool POP is not currently a product in the paid folding collection.

## PDP destinations (existing SEO mini link paragraphs already in Shopify)
All existing relevant products have a bottom-of-description paragraph with `data-ww-seo-education="nov2026"`, one educational link; do not add a second duplicated panel.
- HappyRun G300 Pro /products/happyrun-electric-dirt-bike-g300-pro — add or swap a concise link to G300 Pro vs Nova 5 while preserving three-way comparison where helpful.
- Freego Nova 5 /products/freego-nova5-electric-dirt-bike — replace generic category-guide link with the exact new G300 Pro vs Nova 5 article.
- Rattan LM Ultra /products/rattan-lm-ultra — replace the general fit-check link with the Rattan LM Ultra vs Mooncool POP guide; storage-fit advice remains in related blogs.
- Mooncool POP /products/mooncool-pop-folding-electric-bike — add/swap the Rattan LM Ultra vs Mooncool POP guide, keeping this as a compact on-page buyer-assistance link.
- Carbon Fold 1, Carbon Fold Step-Thru and Fold 2 — existing three-way comparison PDP links are directly relevant; leave alone unless the merchandising team explicitly chooses to prioritize the broad pillar.
- Other first-batch dirt model PDP links are installed; preserve them.

## Existing blog refreshes
Three older articles already show edits as of ~18:28 UTC on 2026-11-04:
- /blogs/e-bike-buying-guides/electric-dirt-bike-buying-guide-2026
- /blogs/e-bike-reviews-comparisons/60v-vs-72v-electric-dirt-bikes
- /blogs/e-bike-reviews-comparisons/urtopia-carbon-1-pro-vs-carbon-fold-step-thru

These contain links to already-published Phase 1 guides. New Phase 2 links may be added by idempotent refresh after the Phase 2 articles are live and live QA completed; preserve old editorial content and canonical IDs.

## Stage 03 final review links
- https://wattwheelz-shopify-content-ops-info-19821198.vercel.app/?job=best-folding-ebikes-2026
- https://wattwheelz-shopify-content-ops-info-19821198.vercel.app/?job=rattan-lm-ultra-vs-mooncool-pop-folding-ebike
- https://wattwheelz-shopify-content-ops-info-19821198.vercel.app/?job=happyrun-g300-pro-vs-freego-nova5-electric-dirt-bike

Individual Shopify OAuth and final human Publish approval are required. Keep Stage 03 product validation, live-link check, current 16:9 cover check, fingerprint and rollback intact.
