# Mode: profile-revealing

Find the single best button or link that navigates deeper into the escort's profile or opens their contact flow.

## Include

- CTAs leading to the escort's dedicated profile page ("View profile", "Full profile", "See full ad", "More details")
- Contact or messaging flow openers ("Contact", "Send message")
- Any link or button clearly intended to deepen access to this specific escort's listing

## Exclude

- Generic site navigation (home, search, category menus, login, back)
- Pagination controls or unrelated listing links
- Advertisement or banner links

Return exactly one ID — the most relevant match — with brief reasoning.

## shouldClickAllAtOnce

Set `shouldClickAllAtOnce: false` — only one element is returned and it should be clicked individually.
