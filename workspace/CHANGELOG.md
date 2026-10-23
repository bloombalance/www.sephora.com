<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
## 2026-10-23 — Improve cart/search/profile symbols in header
- Updated `src/App.tsx` header action buttons with dedicated classes for search, profile, and bag icons.
- Updated `tailwind.css` to add elevated icon-button styling, refined hover states, and improved cart badge placement.
- Updated workspace memory/docs: `workspace/CODER.md` and `workspace/DATABASE.md`.

## 2026-10-23 — Add K-beauty credibility and compliance guardrails (plan step 4)
- Updated `src/App.tsx` to enforce explicit “inspired by routines popular in K-pop beauty trends” messaging and avoid endorsement-style copy.
- Added CMS-editable `sourceTransparencyNote` support in product editorial JSON parsing and surfaced this note on PDP content.
- Updated CMS editorial guidance text in `src/App.tsx` for compliant wording and sourcing transparency conventions.
- Updated workspace memory/planning files: `workspace/CODER.md`, `workspace/DATABASE.md`, and `workspace/TODO.md`.

## 2026-10-23 — Define K-beauty assortment + content model (plan step 1)
- Updated `src/App.tsx` with a K-beauty assortment blueprint (cleanser, essence, serum, moisturizer, SPF, lip tint, cushion) mapped to existing commerce entities.
- Extended normalized product metadata with `routineStep`, `skinConcern`, `finish`, and `inspiredByCopy` sourced from `EditorialBlock` product JSON.
- Added a CMS blueprint panel and updated editorial guidance to formalize the K-beauty metadata contract before data seeding.
- Updated workspace tracking/planning in `workspace/CODER.md`, `workspace/DATABASE.md`, and `workspace/TODO.md`.

## 2026-10-23 — Add Shop the Look visual grid with clickable hotspots
- Updated `src/App.tsx` to add a new `shop-look-section` in `Home`, including clickable face/lips/eyes/hair hotspots tied to exact products.
- Implemented hotspot-driven add-to-cart behavior plus companion product cards for one-click add from the same look.
- Added new Shop the Look styles in `tailwind.css` for visual layout, hotspot pulse affordance, active states, and mobile responsiveness.
- Updated workspace tracking in `workspace/CODER.md`, `workspace/DATABASE.md`, and `workspace/TODO.md`.

## 2026-10-23 — Add interactive routine builder quiz and remove debug log
- Updated `src/App.tsx` with a new `RoutineBuilderModal` quiz that recommends curated bundles and supports bundle add-to-cart.
- Added quiz entry action in the home shop section and removed temporary `__ANIMA_DBG__` mount logging from `Storefront`.
- Added routine-builder presentation styles in `tailwind.css`, including responsive modal/quiz/result layouts.
- Updated workspace memory/planning in `workspace/CODER.md`, `workspace/DATABASE.md`, and `workspace/TODO.md`.

## 2026-10-23 — Add PDP virtual try-on and shade matching
- Added `VirtualTryOn` in `src/App.tsx` with live camera, local photo upload, shade preview, and sampled shade recommendation.
- Kept shopper media browser-local and added camera stream/object URL cleanup.
- Added responsive try-on modal and preview styling in `tailwind.css`.
- Updated implementation and privacy conventions in `workspace/CODER.md`, `workspace/DATABASE.md`, and `workspace/TODO.md`.

## 2026-10-23 — Fix misleading read-only build failure in CMS JSX
- Updated `src/App.tsx` to render the `product:<productId>` CMS placeholder as text instead of parsing `<productId>` as JSX.
- Searched `src/*.tsx` for matching malformed code-placeholder patterns and found no other occurrences.
- Added a temporary `__ANIMA_DBG__ storefront-mounted` marker for current-revision preview verification.
- Updated debugging memory and preview-validation planning in `workspace/CODER.md` and `workspace/TODO.md`.

## 2026-10-22 — Complete CMS-driven merchandising integration
- Updated `src/App.tsx` so homepage merchandising, collection slots, promo modules, and PDP support copy render from `EditorialBlock` + `Collection` entities only.
- Added product-level merchandising fields parsing (`collectionSlugs`, `selectionLabel`, `howToUse`, `fullDetails`, `selectionGuide`) and CMS section-ID guidance in the editorial tab.
- Updated `tailwind.css` with collection slot and promo layout styles plus catalog tool responsiveness.
- Updated workspace memory/planning files: `workspace/CODER.md`, `workspace/DATABASE.md`, `workspace/TODO.md`.

## 2026-10-22 — Follow-up fix for repeated "Babel is not defined" at `src/index.tsx`
- Updated `src/index.tsx` to use `createElement` bootstrap instead of JSX to remove any JSX/Babel runtime dependency from entry mount.
- Re-scanned for repeat misuse patterns (`Babel`, `@jsx`, `text/babel`) and found no code matches outside workspace notes.
- Recorded repeat-pattern handling in `workspace/CODER.md`.

## 2026-10-22 — Fix build error: "Babel is not defined" at `src/index.tsx`
- Updated `src/index.tsx` to use explicit `createRoot`/`StrictMode` imports with a guarded app-root lookup.
- Removed non-null assertion mount pattern to avoid brittle entrypoint transpilation/runtime paths.
- Searched repo for repeat Babel misuse signatures and found no additional source-code matches.
- Updated workspace memory in `workspace/CODER.md`.

## 2026-10-22 — Harden trust, performance, and UX quality
- Updated `src/App.tsx` with commerce-loading skeleton components, retry actions, accessibility semantics, and memoized cart count.
- Added speed and accessibility refinements in `src/App.tsx`: lazy/async image loading, skip-link targeting, aria-live errors, and improved form autofill metadata.
- Updated `tailwind.css` with skip-link/focus-visible styles, shimmer skeleton styles, and reduced-motion protections.
- Updated workspace tracking in `workspace/CODER.md` and retargeted TODO in `workspace/TODO.md`.

## 2026-10-22 — Step 2 continuation: saved-cart snapshots and wishlist quick add
- Updated `src/App.tsx` to support up to five user-scoped saved cart snapshots with legacy payload migration and targeted restore by snapshot id.
- Expanded `/account` in `src/App.tsx` to show saved-cart history cards and added wishlist "Add to bag" actions.
- Added new account saved-cart styles in `tailwind.css` (`.account-saved-carts`, `.account-saved-card`, `.account-saved-head`).
- Updated memory/planning docs: `workspace/CODER.md`, `workspace/DATABASE.md`, and `workspace/TODO.md`.

## 2026-10-22 — Finish account/wishlist/saved-cart UI styling
- Updated `tailwind.css` with missing styles for `.account-*` views, wishlist states, and saved-cart secondary actions.
- Added active-state visuals for wishlist buttons (`.wish-button.active`, `.wishlist-toggle.active`) and account layout responsiveness.
- Preserved existing logic in `src/App.tsx`; this pass completes presentation for already-implemented account flows.
- Updated workspace memory in `workspace/CODER.md` for the styling completion context.

## 2026-10-22 — Patch recovery: accounts, wishlist, and saved cart flows
- Re-applied failed `replace_in_file` changes in `src/App.tsx` with precise SEARCH/REPLACE blocks.
- Added `/account` route with authenticated account dashboard (orders, wishlist, saved cart restore).
- Added wishlist toggles on product cards/PDP and user-scoped localStorage keys for cart, wishlist, and saved cart state.
- Updated checkout success handling to clear cart via `onCheckoutSuccess` callback from `Storefront`.
- Updated workspace tracking in `workspace/CODER.md` and planning in `workspace/TODO.md`.

## 2026-10-22 — Step 1: production checkout and order lifecycle
- Added checkout and order confirmation routes in `src/App.tsx` (`/checkout`, `/order/:orderNumber`) with success/failure/pending status states and retry flow.
- Implemented payment processing abstraction plus inventory validation/decrement logic using SDK queries/mutations for `ProductVariant` and `Inventory`.
- Added transactional writes for `Order`, `OrderLineItem`, and `EmailDispatch` in `src/App.tsx` to persist lifecycle events and confirmation dispatch state.
- Updated cart checkout action to route through the new checkout flow and clear cart on successful authorization.
- Added checkout/order UI styles in `tailwind.css`; updated workspace memory files (`workspace/CODER.md`, `workspace/DATABASE.md`, `workspace/TODO.md`).

## 2026-10-22 — Add Korean Skincare category
- Updated category filter generation in `src/App.tsx` to include Korean Skincare as a stable catalog option.
- Extended footer shop links in `src/App.tsx` with Korean Skincare for quick navigation.

## 2026-10-22 — Add category options for catalog browsing
- Updated category filter generation in `src/App.tsx` to always include Beauty Accessories, Supplements, and Facial Tools.
- Extended footer shop links in `src/App.tsx` to expose the new categories in storefront navigation.
- Kept existing dynamic product-driven categories intact while adding stable category options for empty/partial catalogs.

## 2026-10-22 — Step 2: CMS content types and editor workflows
- Added owner CMS route and tabbed editors in `src/App.tsx` for Product, ProductVariant, Inventory, Collection, and EditorialBlock.
- Connected CRUD to `useQuery`/`useMutation` from `@animaapp/playground-react-sdk`, including publish toggles and active-state controls.
- Implemented editorial content version incrementing on save and slug/SKU normalization in write flows.
- Added CMS UI styling and responsive behavior in `tailwind.css` (`.cms-*` classes).
- Updated workspace planning/memory files for step progression (`workspace/CODER.md`, `workspace/DATABASE.md`, `workspace/TODO.md`).

## 2026-10-22 — Step 1: Commerce domain and schema modeling
- Added SDK dependency in `package.json` and wrapped app with `AnimaProvider` in `src/index.tsx`.
- Refactored `src/App.tsx` to query `Product`, `ProductVariant`, `Inventory`, `Collection`, and `EditorialBlock` from `@animaapp/playground-react-sdk`.
- Implemented normalized domain mapping with required-field validation, publish-state filtering, unique slug/SKU checks, and editorial version parsing.
- Removed all `__ANIMA_DBG__` logs and verified no legacy store/zustand references remain in `src`.
- Updated workspace memory files for CMS migration progress (`workspace/CODER.md`, `workspace/DATABASE.md`, `workspace/TODO.md`).

## 2026-10-22 — Bloom$Balance e-commerce rebuild
- Replaced the imported storefront with a branded, responsive commerce experience in `src/App.tsx`.
- Added routed product pages, filters, variation guides, persistent cart state, trust messaging, and GSAP reveals.
- Established the visual system in `tailwind.css` and updated metadata in `index.html`.
- Removed obsolete generated Sephora components under `src/components` and `src/sections`.
</changelog>
