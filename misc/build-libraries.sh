#!/bin/bash
set -e

# qrcode
cp node_modules/qrcode/build/qrcode.js library/qrcode.js

# jimp
cp node_modules/jimp/browser/lib/jimp.js library/jimp.js

# splide
mkdir -p library/splide
cp node_modules/@splidejs/splide/dist/css/splide.min.css library/splide/splide.min.css
cp node_modules/@splidejs/splide/dist/js/splide.min.js library/splide/splide.min.js

# react
mkdir -p library/react
cp node_modules/react/umd/react.production.min.js library/react/react.production.min.js
cp node_modules/react-dom/umd/react-dom.production.min.js library/react/react-dom.production.min.js

# tesseract
mkdir -p library/tesseract
cp node_modules/tesseract.js/dist/tesseract.min.js library/tesseract/tesseract.min.js
cp node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js library/tesseract/tesseract-core-simd-lstm.wasm.js
cp node_modules/tesseract.js/dist/worker.min.js library/tesseract/worker.min.js
curl -L -o library/tesseract/eng.traineddata https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/eng.traineddata
