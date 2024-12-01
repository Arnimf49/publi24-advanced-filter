# Publi24 advanced filter

https://chromewebstore.google.com/detail/publi24-advanced-filter/pigkjfndnpblohnmphgbmecaelefaedn?authuser=0&hl=en

## Development

- Compile template:
  ```bash
  npx watch "handlebars src/template -f src/template/templates.precompiled.js" src/template
  ```
- Pack plugin:
  ```bash
  web-ext build
  ```

## TODO

- automatically pre-analyze for number all ads from page
- global button to display ads with number
