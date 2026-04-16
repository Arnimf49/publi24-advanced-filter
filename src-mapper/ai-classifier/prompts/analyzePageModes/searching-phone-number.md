# Mode: searching-phone-number

Assess the phone number situation on this page and report what the main agent should do next.

## Output fields

- **phonesFound** — true only if a complete, unmasked phone number is visible in plain text with no action required
- **contactGated** — true if a mechanism is actively blocking access to the contact/phone
- **suggestedActions** — specific, actionable next steps (or null if none apply)

## Phone visibility states

| State | phonesFound | contactGated |
|-------|-------------|--------------|
| Full number visible in plain text | true | false |
| Full phone number visible in text + `sms:` link with full number (e.g. `sms:4437157432`) | true | false |
| Masked placeholder (08X XXX, +40 7XX…) + reveal button | false | true |
| No number shown, but a "reveal/show number" button or masked placeholder exists | false | true |
| "Send message" / "Trimite mesaj" outbound form button only (user fills their own info) | false | false |
| Login wall / paywall / subscription gate blocking phone | false | true |
| Contact button redirects to a **different domain** | false | true |
| Messaging app button only (WhatsApp, Telegram, etc.) | false | false |
| SMS shortcode link only (e.g. `sms:1550?body=…`) | false | false |
| Listing page — phones on individual profile pages | false | false |
| **No phone, no placeholder, no reveal button, no gate** | false | false |

**Masked = gated:** Any phone-like string with X or asterisk placeholders next to a reveal button is contact-gated. Set `phonesFound: false, contactGated: true`.

**Off-domain redirect = gated:** If the only visible contact button or link points to a completely different domain than the current page, treat this as a contact gate. Set `contactGated: true`.

**Outbound contact forms are NOT gates:** A "Send message" / "Trimite mesaj" button that opens a modal or form asking the USER to fill in their own name, phone, or message text to send TO the escort is an outbound messaging flow. The escort's phone is never revealed. Set `contactGated: false, phonesFound: false`. Do NOT treat this as a gate.

**SMS shortcodes are not phone numbers and not gates:** An `sms:` scheme link such as `sms:1550?body=…` is a premium SMS service shortcode, not a direct phone number and not a browser-clickable contact gate. If this is the only contact method, set `phonesFound: false, contactGated: false` and note it in `suggestedActions`.

**`sms:` links with full numbers — phone IS visible:** If an `sms:` link contains a full phone number (7+ digits, e.g. `sms:4437157432` or `sms:443-715-7432`) AND that number is also displayed as readable text on the page (e.g. in a table row or label), treat it as `phonesFound: true`. The number is visible — the `sms:` is just its call-to-action. Do NOT confuse this with a shortcode.

**No evidence ≠ gated:** If the page simply has no phone number, no masked placeholder, no reveal button, and no login/paywall/captcha blocking anything — set `contactGated: false`. The absence of phone information is not a gate. Do NOT set `contactGated: true` just because no phone is visible.

## suggestedActions rules

- On an **individual profile page** with contact/reveal buttons → suggest clicking that specific button
- On a **listing/directory page** with no phones visible → suggest navigating to a specific profile URL
- If the page has no phone evidence whatsoever (no number, no placeholder, no button, no gate) → set `suggestedActions: null`
- Do not suggest navigating to profile pages when already on one

## Contact gate criteria

Set `contactGated: true` **only** when there is a concrete, active barrier:
- Login wall, subscription paywall, or "unlock contact details" prompt visibly blocking content
- CAPTCHA or human-verification challenge present on the page
- Masked/partial phone number (X or asterisk placeholders) with a show/reveal button present
- Contact button/link that redirects to a different domain (off-site gating)

**Not gates:** Messaging app buttons (WhatsApp, Telegram, Viber, phone icon), outbound contact/send-message forms, and SMS shortcodes are **not** gates — note them in suggestedActions if relevant.

→ Call `set_phone_search_result` with your verdict.
