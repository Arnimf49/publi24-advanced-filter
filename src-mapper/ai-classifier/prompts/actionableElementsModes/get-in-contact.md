# Mode: get-in-contact

Find elements that initiate or continue a contact flow — used when phone reveal has failed on multiple profiles. The goal is to detect whether the site routes contact through an off-domain redirect (bait), a genuine access gate, or a messaging-platform link that contains an embedded phone number.

## Include

- WhatsApp, Telegram, Viber, Signal, or other messaging app buttons — especially if their `href` contains an embedded phone (e.g. `wa.me/+1234567890`, `t.me/+40712345678`)
- "Contact", "Get in touch", "Book now", "Chat with me", "Message me" buttons or links that open an inline flow (not a user-to-escort fill-in form)
- Buttons or links labeled with a phone icon that do NOT yet have a visible number — these may reveal a number or redirect
- Any button that leads to a contact modal, popup, or overlay on the same domain

## Never include

- "Send message" / "Trimite mesaj" / contact forms that ask the USER to fill in their own name, email, phone, or message — these are outbound forms, the escort's number is never exposed
- Close buttons (×, ✕, X) or dismiss/cancel controls
- `sms:` scheme links (premium SMS shortcodes / gateways)
- Links pointing to a **different domain** — if clicking would navigate off-site, that is redirect bait, not a real contact flow
- Generic site navigation (home, search, login, registration, back)
- Social media profile links (Instagram, Twitter/X, Facebook) unless they directly embed a phone

## Purpose and interpretation

After you click an element from this mode, observe what happened:
- **Messaging app link opened (WhatsApp/Telegram) with a phone in the URL** → extract and verify the phone number. This is a real contact.
- **Login wall, subscription prompt, or "Sign in to view" appeared** → this is a contact gate. Classify as ESCORT with `contactAccess="contact_gated"` immediately.
- **CAPTCHA or human-verification challenge appeared** → contact gate. Classify as ESCORT with `contactAccess="contact_gated"` immediately.
- **Redirect to a different domain** → this is bait/redirect. The site does not host real contact info. Classify as BAD.
- **Contact form asking the user to fill in their own details appeared** → not a phone reveal, skip and treat as no contact mechanism.

## shouldClickAllAtOnce

Set `shouldClickAllAtOnce: false` — click elements one at a time and observe the outcome before proceeding to the next.
