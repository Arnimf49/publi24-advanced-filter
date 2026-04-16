# Mode: is-domain-escort-listing

Determine whether this website is an escort listing site.

## Verdict: yes

Set `isEscortListing: "yes"` when the page shows:
- Individual escort profiles with physical attributes, service descriptions, or contact info
- A directory of multiple escort ads linking to individual profiles
- Adult companionship or companion service presentation

When setting `"yes"`, you **must** also set `isAgency`:
- `true` — centrally managed roster, branded "our escorts / our girls", centralised booking, uniform professional presentation
- `false` — classifieds / open ad platform, self-managed independent profiles, "post your ad" functionality

## Verdict: no

Set `isEscortListing: "no"` and **stop immediately** — do not assess gating, do not call other tools.

Use "no" for:
- Legitimate non-sexual businesses (massage without sexual services, wellness, spa, salon)
- Ecommerce or product listings (adult retail, sex toys, lingerie)
- Cam platforms or live chat platforms
- Dating sites or chat funnels
- News, articles, or blogs
- Generic or non-adult directories
- **Adult video / porn tube sites** — identified by: per-thumbnail metadata (duration + view count + star rating), a models/pornstars/studios navigation section, `<video>` elements or embedded players, video-count headings, URL paths such as `/pornstars`, `/studios`, `/search`
- **Sex games or adult gaming / interactive entertainment platforms**
- Sites whose navigation prominently features "Sex Games", "Live Sex", "Cam", "Live Chat", "Porn", or "Adult Videos" — these indicate cam/video/gaming platforms, not escort listings

## What is NOT escort evidence

Do not let these signals push you toward "yes" or "maybe":
- Navigation links or section headers containing "Sex Games", "Live Sex", "Cam shows", "Live Chat", or "Porn"
- Generic sexual or adult-themed language in page titles or navigation without accompanying profile/service structure
- Adult-adjacent content (lingerie, sex toys, adult retail)
- A phone number, WhatsApp link, or booking CTA in isolation
- Profile photos without accompanying service or rate descriptions
- Profiles that describe relationship preferences, hobbies, occupation, or personality ("In Cautare De: Relație serioasă", "Ocupatie: Designer") — these are **dating site profiles**, not escort listings
- "Matrimoniale" (matrimonial/personals) sites or platforms primarily focused on relationships or companionship dating

## Verdict: maybe

Set `isEscortListing: "maybe"` when:
- Page purpose is genuinely ambiguous
- Content is gated or blocked so signals are unclear
- It is a thin landing page with insufficient evidence

For "maybe": provide up to 2 `topNavigation` targets that would resolve the ambiguity. Prefer going one level up in the URL path (breadcrumb); fall back to the homepage. Avoid top-menu items — they rarely lead to better evidence.

## Overlay / gate detection

Set `hasVerificationGating: true` when ANY blocking overlay is present before the actual page content is accessible:
- Age verification gate ("I confirm I am 18+", date-of-birth form)
- Cookie consent banner that covers the page
- Privacy/GDPR accept screen
- Adult content warning requiring confirmation
- Any full-screen modal that must be dismissed before using the page

Set `hasVerificationGating: false` only when content is fully accessible with no overlay.
When true, list every detected overlay in your reasoning.

## Key principle

Legal disclaimers ("advertising platform", "not an escort agency") do not negate escort evidence. Evaluate what the page actually contains, not what it claims about itself.

→ Call `set_escort_listing_domain` with your verdict.
