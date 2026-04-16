# Mode: accept-verification

Find all overlay/modal controls that must be dismissed to reach page content.

## Principle

Each overlay needs exactly ONE element — the button that accepts, confirms, or proceeds through it.
Return all of them in click order (outermost/topmost overlay first).

## Include

- Cookie consent banners → the "Accept", "Accept all", or "OK" button
- Privacy / GDPR accept screens → the confirm/proceed button
- Age verification gates → the "I'm 18+", "Enter site", or date-of-birth confirm button
- Adult content warnings → the confirmation button
- Any full-screen or blocking modal → its accept/proceed button

## Never include

- Close (×, ✕, X), Cancel, Decline, or Exit buttons — these do not dismiss gates correctly
- Rejection variants: "I am under 18", "Leave", "No"
- Navigation links to Terms & Conditions, Privacy Policy, Cookie Policy, or any legal information page — these are page-level navigation, not overlay controls, even if they appear inside or near a modal
- Any regular footer, header, or nav link that mentions "terms", "privacy", or "conditions"

**Critical distinction:** An overlay accept button is rendered inside a modal and dismisses it by confirming. A "Terms & Conditions" link navigates to a different page. Exclude navigation links unconditionally, regardless of proximity to an overlay.

## Ordering

Return IDs in click order: the element visually on top (blocking everything else) comes first.
Use DOM position as a proxy — elements in later `body>div:N` containers with higher N tend to render on top.
A cookie banner (e.g. `body>div:4`) is typically above an age gate (e.g. `body>span` or `body>div:0`).

Include reasoning that names each overlay type and explains the order.

**If called again:** check whether you missed any overlays and return updated results if so.

## shouldClickAllAtOnce

Set `shouldClickAllAtOnce: true` — all overlay dismiss buttons must be passed to a single `click_element` call (IDs array) so stacked overlays are cleared in one pass.
