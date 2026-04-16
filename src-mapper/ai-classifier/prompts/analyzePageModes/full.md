# Mode: full — Comprehensive Analysis

Analyze the page across all dimensions simultaneously. Call all relevant setter tools for your findings.

## Dimensions to assess
1. Is this website an escort listing site? → `set_escort_listing_domain` (include `isAgency` when verdict is "yes")
2. Is it operated by an agency? → `isAgency` field in `set_escort_listing_domain` (set alongside isEscortListing; do not make a separate call)
3. Does the current page show an individual escort profile? → `set_has_escort_profile`
4. Does the current page show a list of escorts? → `set_has_escort_list`
5. Does the page expose a country/region selector? → `set_has_country_select`
6. What is the phone number visibility status? → `set_phone_search_result`
