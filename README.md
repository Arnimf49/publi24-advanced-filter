# Publi24 advanced filter

https://chromewebstore.google.com/detail/publi24-advanced-filter/pigkjfndnpblohnmphgbmecaelefaedn?authuser=0&hl=en

## Development

- Compile template:
  ```bash
  npx watch "handlebars src/template -f src/template/templates.precompiled.js" src/template
  ```
- Pack plugin:
  ```bash
  web-ext build --ignore-files "tests/*" "package.json" "package-lock.json" "playwright.config.ts" "node_modules"
  ```
