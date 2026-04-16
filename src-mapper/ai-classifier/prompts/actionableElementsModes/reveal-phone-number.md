# Mode: reveal-phone-number

Find actionable elements that could reveal or provide direct access to a phone number or contact method.

## Include

- "Show number", "Reveal phone", "View contact" buttons
- Phone icon buttons that expand to display a number
- "Call" or "Contact" buttons positioned near masked phone placeholders (e.g. `+40 7XX XXX…`)
- Phone reveal or contact-unhide controls
- WhatsApp, Telegram, Viber, or other messaging app buttons — the phone number is often embedded in their `href` (e.g. `wa.me/+1234567890`) or revealed after clicking
- Messaging app buttons whose `href` contains an embedded phone (e.g. `wa.me/+40712345678`, `t.me/+40712345678`) — the number is in the URL itself

## Never include

- "Send message", "Trimite mesaj", "Contact me", or any button that opens an **outbound contact form** — a modal or page asking the USER to fill in their own name, phone, or message text to send TO the escort. These are messaging-out flows, not phone-reveal actions. The escort's phone is never displayed.
- Close buttons (×, ✕, X) or dismiss/cancel controls of any kind — even if they appear inside a contact modal.
- `sms:` scheme links (e.g. `href="sms:1550?body=…"`) — these are premium SMS shortcodes or SMS gateways that **cannot be opened by browser automation**. Their presence does NOT mean a phone number is revealable.
- Any link or button whose `href` points to a **different domain** — off-domain contact redirects are gating the user to another site, not revealing a phone on this one.
- Navigation or login buttons unrelated to phone/contact reveal.

**If after applying these rules no element qualifies, return an empty `elementIds` array. Do not fall back to unrelated controls.**

## Context clues

- Proximity to masked phone placeholders
- Contact sections with expandable content
- Messaging app icons or branded buttons (WhatsApp green, Telegram logo, etc.)

Return all matching element IDs ordered by likelihood of revealing a real contact (most direct first) with a brief reasoning for each. If no matching elements exist, return an empty array.

## shouldClickAllAtOnce

Set `shouldClickAllAtOnce: false` — click elements one at a time and observe the result before proceeding to the next.
