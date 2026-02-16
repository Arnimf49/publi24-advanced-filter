#!/bin/bash
set -e

echo "Building with rollup..."
rollup -c

echo "Building Chrome version..."
web-ext build --ignore-files "tests" "test-results" "misc" "src" "src-mapper" "package.json" "package-lock.json" "playwright.config.ts" "node_modules" "tsconfig.json" "rollup.config.js" "scripts" --overwrite-dest

MANIFEST_VERSION=$(jq -r '.version' manifest.json)
ORIGINAL_ZIP="web-ext-artifacts/publi24_filtru_avansat-${MANIFEST_VERSION}.zip"
CHROME_ZIP="web-ext-artifacts/publi24_filtru_avansat-${MANIFEST_VERSION}-chrome.zip"

mv "$ORIGINAL_ZIP" "$CHROME_ZIP"
echo "Created: $CHROME_ZIP"

echo "Modifying manifest for Firefox..."
cp manifest.json manifest.json.bk
jq '.background = {scripts: ["dist/common/background.js"]}' manifest.json > manifest.json.tmp
mv manifest.json.tmp manifest.json

echo "Building Firefox version..."
web-ext build --ignore-files "tests" "test-results" "misc" "src" "src-mapper" "package.json" "package-lock.json" "playwright.config.ts" "node_modules" "tsconfig.json" "rollup.config.js" "scripts" --overwrite-dest

FIREFOX_ZIP="web-ext-artifacts/publi24_filtru_avansat-${MANIFEST_VERSION}-firefox.zip"
mv "$ORIGINAL_ZIP" "$FIREFOX_ZIP"
echo "Created: $FIREFOX_ZIP"

echo "Reverting manifest..."
mv manifest.json.bk manifest.json

echo "Creating main branch archive..."
git archive --format=zip --output ./web-ext-artifacts/publi24_filtru_avansat--main.zip main

echo "Build complete!"
