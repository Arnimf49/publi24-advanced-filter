# Mode: has-escort-list

Determine whether the current page contains a directory or listing of multiple escort profiles.

## What counts as a listing
- Multiple escort cards or entries on the same page, each linking to an individual profile
- Grid or list layout with thumbnails
- Pagination or load-more controls
- Filter or sort options (city, category, price)
- Category or city-based organization of profiles

## If found → `found: true`

Identify up to 2 individual profile URLs in `escortProfileUrls` for the main agent to navigate to.
**Only include same-host URLs.** Never return affiliate links, tracker URLs, or any URL whose domain differs from the page being analysed.

## If not found → `found: false`

Provide up to 2 `mightFindListOnPage` targets where a listing is likely to exist. Same-host only — no external links.

→ Call `set_has_escort_list` with your verdict.
