<instructions>
This file will be automatically added to your context. 
It serves multiple purposes:
  1. Storing frequently used tools so you can use them without searching each time
  2. Recording the user's code style preferences (naming conventions, preferred libraries, etc.)
  3. Maintaining useful information about the codebase structure and organization
  4. Remembering tricky quirks from this codebase

When you spend time searching for certain configuration files, tricky code coupled dependencies, or other codebase information, add that to this CODER.md file so you can remember it for next time.
Keep entries sorted in DESC order (newest first) so recent knowledge stays in prompt context if the file is truncated.
</instructions>

<coder>
# 2026-10-23 — Header icon polish for search/profile/cart
- Updated `src/App.tsx` header action buttons to use explicit icon-button classes for search, profile, and bag controls.
- Refined icon sizing/stroke balance to improve clarity and perceived quality at desktop and mobile breakpoints.
- Updated `tailwind.css` with elevated pill buttons, contextual hover states, and a cleaner cart-count badge treatment.
- No behavior changes to auth/cart/search wiring; this pass is visual polish only.

# 2026-10-23 — K-beauty step 4 credibility/compliance guardrails
- Updated `src/App.tsx` to normalize K-beauty messaging toward explicit “inspired by routines popular in K-pop beauty trends” language.
- Added CMS-editable `sourceTransparencyNote` parsing via product editorial JSON (`product:<productId>`) and surfaced it on PDP.
- Added runtime copy sanitization for inspired-by messaging to reduce endorsement-style phrasing drift in storefront content.
- Expanded CMS guidance text to document compliance-safe wording and sourcing-note key usage.

# 2026-10-23 — K-beauty step 1 content-model definition
- Added a reusable K-beauty assortment blueprint in `src/App.tsx` (cleanser, essence, serum, moisturizer, SPF, lip tint, cushion) for approved plan step 1.
- Defined product-level routine metadata model on normalized catalog objects: `routineStep`, `skinConcern`, `finish`, `inspiredByCopy`.
- Extended product editorial parsing (`product:<productId>`) to support new metadata keys while preserving existing shade/benefit/guide fields.
- Added CMS blueprint panel that maps each planned item to `Product`, `ProductVariant`, `Inventory`, `Collection`, and `EditorialBlock` usage before data seeding.

# 2026-10-23 — Shop the Look + routine builder baseline
- `Home` includes `shop-look-section` with clickable face/lips/eyes/hair hotspots tied to direct add-to-cart behavior.
- Added `RoutineBuilderModal` quiz with client-side scoring and one-click bundle add.
- Styling for hotspot cards and routine modal lives in `tailwind.css`.

# 2026-10-23 — Virtual try-on behavior
- PDP includes `VirtualTryOn` with camera/live preview and local photo upload.
- Uploaded/captured media remains browser-local; stream/object URL cleanup is handled on close/unmount.
- Shade recommendation samples preview pixels and maps to available product shades.

# 2026-10-22 — CMS + storefront architecture
- App is CMS-driven via Anima SDK entities: `Product`, `ProductVariant`, `Inventory`, `Collection`, `EditorialBlock`.
- Route structure in `src/App.tsx`: `/`, `/product/:slug`, `/checkout`, `/order/:orderNumber`, `/account`, `/cms`.
- Product details and merchandising copy resolve from editorial JSON per `sectionId` and product block IDs.
</coder>
