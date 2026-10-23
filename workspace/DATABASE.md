<instructions>
This file tracks your database decisions, conventions, and preferences.
It does NOT store the current schema — entity definitions are injected per-request automatically.
Instead, use this file to remember:
  1. Data storage preferences (e.g., "store image references as storage paths, not full URLs")
  2. Schema conventions (e.g., "always use soft deletes", "snake_case column names", "every table gets createdAt/updatedAt")
  3. Anti-patterns to avoid (e.g., "don't store computed values", "no direct user-to-user foreign keys")
  4. Data flow decisions (e.g., "auth state comes from session, not DB lookup per request")
  5. Indexing and query patterns worth remembering

When the user makes a database-related decision, proactively capture the *why* here so you don't forget it.
Keep entries sorted in DESC order (newest first) so recent decisions stay in prompt context if the file is truncated.
</instructions>

<database>
# Database Decisions & Conventions

## 2026-10-23 — Header symbol visual polish
- Search/profile/cart updates are strictly presentation-layer changes in header UI.
- No entity, field, storage, or query-path changes were introduced.
- Existing cart/auth interactions remain unchanged and continue to use current local/session flows.

## 2026-10-23 — K-beauty credibility/compliance guardrails (plan step 4)
- Compliance copy remains CMS-driven through `EditorialBlock` product payloads so merchandising can revise references without code migrations.
- Added `sourceTransparencyNote` as a product editorial JSON convention for public-trend sourcing context and non-endorsement transparency.
- Storefront now normalizes `inspiredByCopy` toward explicit “inspired by routines popular in K-pop beauty trends” phrasing.
- Guardrail intent: prevent unverifiable endorsement claims while preserving flexible, editable editorial storytelling.

## 2026-10-23 — K-beauty assortment content model (plan step 1)
- Kept existing schema unchanged and mapped K-beauty routine metadata to `EditorialBlock` JSON under `product:<productId>`.
- Standardized product metadata keys for planned assortment: `routineStep`, `skinConcern`, `finish`, and `inspiredByCopy`.
- Planned assortment is mapped to existing entities only: `Product` (core PDP data), `ProductVariant` (shade/options), `Inventory` (stock), `Collection` (curation slug), `EditorialBlock` (routine metadata and “inspired by K-pop routines” copy).
- This decision avoids premature entity expansion and keeps merchandising tunable by content edits without schema migration.

## 2026-10-23 — Shop the Look data and cart behavior
- Shop the Look hotspots are generated from existing published `Product` records only; no new content entities were added for hotspot placement.
- Hotspot placement metadata is currently deterministic UI layout state in code and does not persist to database.
- Clicking a hotspot writes only through existing cart pathways (local cart state), keeping commerce persistence unchanged.

## 2026-10-23 — Routine builder recommendation scope
- Routine quiz answers and recommendation scoring stay client-side and session-local; no quiz response rows are persisted.
- Curated bundles are derived from existing `Product` fields plus normalized shades/benefits and do not introduce new entities.
- Bundle acceptance is represented only through normal cart actions, preserving current commerce write paths.

## 2026-10-23 — Virtual try-on privacy and shade source
- Virtual try-on media is ephemeral and browser-local; camera frames and uploaded photos are not written to database entities.
- Available try-on shades continue to come from normalized `ProductVariant.shadeName` and product editorial `shades`, avoiding a duplicate shade store.
- Shade recommendations are session-only UI state and are persisted only if the shopper adds the selected variation to cart.

## 2026-10-22 — CMS merchandising section contract
- Homepage merchandising now reads from `EditorialBlock.sectionId` keys: `home:hero`, `home:principles`, `home:collections`, `home:promos`, `home:shop`, `home:story`, `home:newsletter`.
- PDP support content is sourced from `product:<productId>` payload fields: `selectionLabel`, `howToUse`, `fullDetails`, `selectionGuide`.
- Collection-slot filtering uses `Collection.slug` and product editorial `collectionSlugs` intersection, keeping merchandising fully CMS-configured.
- Convention: editorial payloads are JSON objects; invalid JSON falls back to a safe object wrapper to prevent storefront render failures.

## 2026-10-22 — Saved cart persistence convention update (Step 2)
- Saved carts are stored as user-scoped snapshot arrays (`id`, `createdAt`, `items`) in localStorage under `bloom-balance-saved-cart:{userId|guest}`.
- Snapshot list is capped at five records to limit storage growth while preserving recovery history.
- Restore behavior defaults to the latest snapshot and supports explicit restore by snapshot id.
- Legacy single-cart payloads are coerced into a single snapshot for compatibility during rollout.

## 2026-10-22 — Checkout/order lifecycle conventions (Step 1 of improvement plan)
- Added new entities: `Order`, `OrderLineItem`, and `EmailDispatch` to support transactional checkout, fulfillment tracking, and outbound confirmation flows.
- Checkout flow writes `Order` first in `pending`, then transitions to `paid` or `failed` with `paymentStatus` updates and optional `failureReason`.
- `OrderLineItem` stores immutable purchase snapshots (`productName`, `shadeName`, `unitPrice`, `lineTotal`) so post-purchase history survives catalog edits.
- Inventory is validated before payment and decremented across oldest matching inventory rows after successful authorization.
- Confirmation communication is tracked as records in `EmailDispatch` (`queued`/`sent`/`failed`) to keep a durable audit trail.

## 2026-10-22 — CMS workflow conventions (Step 2)
- Product authoring now supports explicit draft/published status in the CMS UI, with publish toggles from list rows.
- EditorialBlock save workflow auto-increments JSON `version` to preserve safe edit history semantics.
- SKU normalization in CMS uppercases `ProductVariant.sku` before write to keep identifier consistency.
- Slug entry is normalized with a deterministic slugify function for Product and Collection saves.
- Inventory quantities are constrained to non-negative integers at write time.

## 2026-10-22 — Commerce domain model (Step 1)
- Product records are source-of-truth for core catalog fields; only `status: "published"` products are storefront-visible.
- ProductVariant stores SKU-level options and links to Product via `productId`; enforce unique SKU through schema-health validation.
- Inventory is tracked per `variantId` and `location`; aggregate quantity across locations for read-side availability.
- EditorialBlock drives content slots (`sectionId`) and stores JSON payloads for product metadata and versioning (e.g., `version`, `shades`, `benefits`).
- Collection stores editorial merchandising groups via unique `slug`; slug uniqueness and required product fields are validated during normalization.

## 2026-10-22 — Cart persistence
- Keep anonymous cart state in browser localStorage under `bloom-balance-cart`.
- Product catalog data is currently static and colocated with the storefront; migrate to persistent storage only when inventory or checkout integration is introduced.
</database>
