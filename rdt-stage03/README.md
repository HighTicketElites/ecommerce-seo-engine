# Resideterra Shopify Content Ops v1.0

Stage 03 controlled publishing infrastructure for Resideterra.

Successful publication, automatic rollback, and refused publication outcomes render as operator-facing HTML result pages. Machine-readable details remain in the server logs; the browser does not expose raw JSON.

## Control sequence

1. A Shopify administrator selects a publish-eligible manifest.
2. Shopify OAuth authorizes only the fixed `resideterra.myshopify.com` store.
3. The service re-reads the exact draft, its products, metadata, links, body images, and editorial cover.
4. A SHA-256 fingerprint locks every protected article field.
5. The service creates an encrypted, HTTP-only approval session that expires after 5–30 minutes; production is configured for 15 minutes.
6. A separate human click authorizes publication of that exact fingerprint.
7. Immediately before writing, the service re-reads the article and refuses changes, duplicates, published state, inactive products, or failed QA.
8. The service publishes through `articleUpdate`, performs Shopify readback and live-page QA, then records the fingerprint and status in article metafields and structured logs.
9. A critical post-publication failure automatically returns the article to draft. If rollback itself fails, the response is marked critical and requires immediate Shopify verification.

## Isolation and least privilege

- Separate project name: `resideterra-shopify-content-ops`.
- Separate `RDT_PUBLISH_*` credential and cookie namespace.
- Fixed store allowlist: `resideterra.myshopify.com`.
- Required Shopify scopes: `write_content`, `read_products`, and `write_online_store_pages`.
- No product, inventory, order, customer, discount, theme, page, collection, or navigation mutation exists.
- The draft generator remains a separate application and still contains no publication operation.

## Current pilot state

Modern Flames Landscape Pro Multi vs Orion Multi, Fire Magic Echelon vs Aurora vs Choice, The Outdoor Plus Coronado Fire Pit, and Fire and Water Bowls for Pools have completed controlled publication and are locked against replay. Dimplex remains locked. Fire Bowl vs Fire and Water Bowl has passed Stage 02 draft QA and is the current publish-eligible Stage 03 job. A new manifest cannot become publish-eligible until its draft is approved, its editorial cover is complete, and its separate Stage 03 authorization is recorded.

## Measurement

- GA4 measurement ID: `G-98RECGHBCC`
- GA4 property ID: `536961964`
- Search Console source of truth: `sc-domain:resideterra.com`

Measurement identifiers are configuration, not credentials. GA4 Realtime collection and both Search Console properties were manually verified before Stage 03 implementation.

## Required environment variables

See `.env.example`. Secrets must be configured in Vercel and must never be committed or pasted into chat.

## Local certification

Run:

```text
npm test
npm run validate
npm run build
```

Do not execute the final approval button during certification. Production publication remains a separate human decision.
