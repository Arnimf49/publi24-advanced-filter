# Mode: has-country-select

Determine whether the page exposes a **country** or **multi-country region** selector.

## What counts as a selector
- Country or region dropdown (e.g. "Select country", flag icons)
- Country flag links in a header or footer that link to different country sub-sites
- Geographic region tabs or navigation that spans **multiple countries** (e.g. "UK / USA / Australia")
- A location-based structure that starts at the **country level** (country → city hierarchy)
- Interactive map with country selection
- Language/locale picker that corresponds to different countries

## What does NOT count
- A city-only listing or category navigation (e.g. "New York, London, Paris") — cities alone do not imply a multi-country selector
- A single-country directory organised by cities or regions within one country
- A state/province selector within a single country

The key question is: **does the site serve multiple countries and expose a way to switch between them?** If the navigation only goes down to cities without a higher country-level structure, the answer is `found: false`.

## If found → `found: true`

## If not found → `found: false`

Suggest in `nextBestPages` where a country selector might be reachable (e.g. header menu, footer, settings page).

→ Call `set_has_country_select` with your verdict.
