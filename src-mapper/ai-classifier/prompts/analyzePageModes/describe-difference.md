# Mode: describe-difference

Examine the diff above (added/removed lines, actionable element changes) and describe in plain language what happened as a result of the last action.

## Look for
- A CAPTCHA or human-verification challenge appearing
- A login wall, paywall, or subscription gate appearing
- A phone number becoming visible
- A modal, dialog, or overlay opening or closing
- Content loading or refreshing
- Navigation to a new page
- No meaningful change

→ Call `set_page_change` with your reasoning.
