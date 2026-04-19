# Mode: has-country-select

Determine whether the page exposes a **country** or **multi-country region** selector.

## What counts as a selector
- Country or region dropdown (e.g. "Select country", flag icons)
- Country flag links in a header or footer that link to different country sub-sites **on the same registered domain** (subdomains or path-based country versions)
- Geographic region tabs or navigation that spans **multiple countries** (e.g. "UK / USA / Australia")
- A location-based structure that starts at the **country level** (country → city hierarchy)
- Interactive map with country selection

## What does NOT count
- A city-only listing or category navigation (e.g. "New York, London, Paris") — cities alone do not imply a multi-country selector
- A single-country directory organised by cities or regions within one country
- A state/province selector within a single country
- A **language or locale switcher** (e.g. "English", "Français", "EN/FR") — changing the display language does NOT mean the site serves multiple countries. A Romanian site with an English translation is still a Romanian site.
- A **country selector where the links point to completely different registered domains**, not subdomains or subpaths (e.g. linking to checking.com when on another.com). These are separate, independent websites — not country versions of the current site. The current site serves only its own country. Do NOT report found: true for this pattern.

The key question is: **does THIS specific site (same registered domain) serve multiple countries and expose a way to switch between them?** If the navigation only goes down to cities without a higher country-level structure, the answer is `found: false`. If the "country selector" links away to entirely different domains, the answer is also `found: false`.

## If found → `found: true`

## If not found → `found: false`

Suggest in `nextBestPages` where a country selector might be reachable (e.g. header menu, footer, settings page).

If the page clearly serves a **single specific country** (e.g. content is all in Romanian and references Romanian cities, or the domain TLD makes it obvious like `.es` for Spain), set `detectedCountry` to the ISO 3166-1 alpha-2 code (lowercase, e.g. "ro", "es", "de"). If unclear, set `detectedCountry` to null.

→ Call `set_has_country_select` with your verdict.
