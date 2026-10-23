<instructions>
This file powers chat suggestion chips. Keep it focused and actionable.

# Be proactive
- Suggest ideas and things the user might want to add *soon*. 
- Important things the user might be overlooking (SEO, more features, bug fixes). 
- Look specifically for bugs and edge cases the user might be missing (e.g., what if no user has logged in).

# Rules
- Each task must be wrapped in a "<todo id="todo-id">" and "</todo>" tag pair.
- Inside each <todo> block:
  - First line: title (required)
  - Second line: description (optional)
- The id must be a short stable identifier for the task and must not change when you rewrite the title or description.
- You should proactively review this file after each response, even if the user did not explicitly ask, maintain it if there were meaningful changes (new requirement, task completion, reprioritization, or stale task cleanup).
- Think BIG: suggest ambitious features, UX improvements, technical enhancements, and creative possibilities.
- Balance quick wins with transformative ideas — include both incremental improvements and bold new features.
- Aim for 3-5 high-impact tasks that would genuinely excite the user.
- Tasks should be specific enough to act on, but visionary enough to inspire.
- Remove or rewrite stale tasks when completed, obsolete, or clearly lower-priority than current work.
- Re-rank by impact and user value, not just urgency.
- Draw inspiration from the project's existing features — what would make them 10x better?
- Don't be afraid to suggest features the user hasn't explicitly mentioned.
</instructions>

<todo id="seed-kbeauty-cms-data">
Seed K-beauty products, variants, and inventory in CMS
Create the 7-product assortment with shades/options, stock rows, and a dedicated K-beauty collection slug.
</todo>

<todo id="kbeauty-discovery-integration">
Integrate K-beauty assortment into discovery and conversion flows
Feature the collection in homepage slots, routine builder recommendations, and Shop the Look selections with high-intent CTAs.
</todo>

<todo id="kbeauty-compliance-lint">
Add CMS compliance linting for risky endorsement phrases
Warn editors when product editorial JSON includes terms like “used by,” “endorsed,” or specific celebrity claims before publish.
</todo>

<todo id="shop-look-cms-hotspots">
Launch CMS-authored Shop the Look hotspot editor
Allow teams to assign hotspot coordinates and linked product IDs per lifestyle image using editorial JSON, with preview tooling in CMS.
</todo>

<todo id="seo-analytics">
Launch SEO and conversion analytics instrumentation
Add product schema, social metadata, checkout funnel events, consent handling, and campaign attribution.
</todo>
