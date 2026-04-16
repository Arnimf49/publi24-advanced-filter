# Mode: is-escort-listing-agency

Determine whether this escort listing site is operated by a regulated agency or is an open/classifieds-style platform.

## Agency indicators
- Business registration or licensing information
- Centralized branding ("our escorts", "our girls", "book with us")
- Curated or managed roster of escorts
- Centralized booking or contact channel
- Professional, uniform presentation across profiles

## Open listing indicators
- Free ad posting / "post your ad" functionality
- Independent, self-managed advertiser profiles
- Classifieds-style layout (no central identity)
- Unmoderated or user-submitted content

→ Call `set_escort_listing_domain` with your `isAgency` verdict.
