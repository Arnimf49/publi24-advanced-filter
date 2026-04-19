# Mode: has-escort-profile

Determine whether the current page contains a single, individual escort profile.

## What counts as a profile
- One named escort's personal information (name/alias, age, location, physical attributes)
- Service descriptions or pricing
- Personal photos or a photo gallery
- Contact access: phone number, messaging buttons, or a "reveal contact" control
- Personal bio or "about me" text

A profile page may have contact details hidden behind a reveal control — it still counts.
Do **not** count multi-card listing pages as a profile.

## If found → `found: true`

### hasProfileRevealingButtons

Set `hasProfileRevealingButtons: true` if ANY of these are present:
- CTAs navigating to a dedicated profile page ("View profile", "Full profile", "See full ad", "More details")
- Contact or messaging flow openers ("Contact", "Send message", "Write message")
- Messaging-app links or buttons (WhatsApp, Telegram, Viber, Signal — including icon-only variants)
- Phone reveal controls ("Show number", "Reveal phone", phone icon that expands)
- Any button or link clearly intended to deepen access to this escort's contact info or profile

Set `hasProfileRevealingButtons: false` only when the full profile **and** all contact details are already directly visible — no further click or navigation is needed.

When `hasProfileRevealingButtons: true`, the main agent will call `get_actionable_elements(mode: "profile-revealing")` next.

## If not found → `found: false`

Provide up to 2 `profilePages` URLs or element hints where an individual escort profile is likely to be found. These must be profile-detail paths (e.g. /escorts/anna/, /profile/12345), NOT listing or category pages.

→ Call `set_has_escort_profile` with your verdict.

## If found: true — also call register_phone_numbers

After calling `set_has_escort_profile(found=true)`, you MUST also call `register_phone_numbers` with any phone numbers visible on the page. Look for:
- Plain text phone numbers anywhere in the profile
- Masked placeholders (e.g. `+43 7XX XXX XXX`)
- Phone numbers embedded in WhatsApp, Telegram, or Viber hrefs (e.g. `wa.me/+43665...`)

If no phone is visible at all, call `register_phone_numbers` with an empty array.
