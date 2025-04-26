# Publi24 advanced filter

- Chrome: https://chromewebstore.google.com/detail/publi24-advanced-filter/pigkjfndnpblohnmphgbmecaelefaedn?hl=en
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/publi24-filtru-avansat/

## Development

### Installation

You need to the following software to work on the project.

- `nvm` - https://github.com/nvm-sh/nvm
- `Chrome` or `Firefox`

To install dependencies run in order:

1. `nvm install` - installs the necessary node version
2. `npm i` - installs the dependencies

### Commands

- `npm run build` - builds the extension, only needed for releases
- `npm run rollup` - run rollup in development mode
- `npm run pw-open` - open playwright, for running tests visually
- `npm run pw-run` - runs all playwright tests
- `npm run pw-debug -- tests/adPage.spec.ts` - runs playwright visually but in debug mode, for test development

### Loading in Chrome

Changes need to be tested. The unpacked version can be loaded in chrome:

1. Open Chrome.
2. Go to Extensions.
3. Enable Developer mode if not yet enabled.
4. Click Load unpacked.
5. Select the whole root directory of the package. 

>Testing the plugin unpacked does not need the `npm run build`. That is only used when uploading into the Chrome
Web Store.

### Workflow

- When opening a terminal on the project always run first `nvm use` to use the correct node version.
- To reflect code changes in the browser, have Extensions page always open and click the reload button on the unpacked
extension. Also reload Publi24.
- Mobile version also needs to be tested for changes. This can be achieved from Chrome inspector.

## Technical overview

The project renders different templates for different purposes into existing elements of Publi24. Different sites load
different JS files for handling functionalities. These are specified in `manifest.json`.

- `index.js` -  This is the heart of the plugin, it is loaded on Publi24 domain.
- `search_parser.js` - This is loaded on Google search page. Handles results gathering for searches.
- `search_image_parser.js`- This is loaded on Google Lens page. Handles image results gathering.

Rendering is done with React and scss modules. Rendering is also based around storage. The render cycle 
reacts to storage changes, which are detected using events. The stored data is fragmented in two:

- `browser.storage.local` - This is extension specific API. It is used for data that needs to be accessed cross site,
specifically the data the is collected from searches.
- `storage.ts` - This file encapsulates the `localstorage` used for the extension. This is only used on the 
Publi24 domain. Handles storing all other information and also upgrades to the storage schema.

The library directory stores 3rd party packages. These are taken from CDNs and hardcoded as Chrome Web Store doesn't 
really accept loading in JS files from the internet for security reasons.
