#!/bin/bash
set -e

check_file() {
    local src=$1
    local dst=$2
    local name=$3

    if [[ "$src" =~ ^https?:// ]]; then
        local tmp_file=$(mktemp)
        curl -sL -o "$tmp_file" "$src"
        if ! cmp -s "$tmp_file" "$dst"; then
            rm "$tmp_file"
            echo "NOT OK: $name"
            return 1
        else
            rm "$tmp_file"
            echo "OK: $name"
            return 0
        fi
    else
        if ! cmp -s "$src" "$dst"; then
            echo "NOT OK: $name"
            return 1
        else
            echo "OK: $name"
            return 0
        fi
    fi
}

status=0

# qrcode
check_file node_modules/qrcode/build/qrcode.js library/qrcode.js "qrcode" || status=1

# jimp
check_file node_modules/jimp/browser/lib/jimp.js library/jimp.js "jimp" || status=1

# splide
check_file node_modules/@splidejs/splide/dist/css/splide.min.css library/splide/splide.min.css "splide.min.css" || status=1
check_file node_modules/@splidejs/splide/dist/js/splide.min.js library/splide/splide.min.js "splide.min.js" || status=1

# react
check_file node_modules/react/umd/react.production.min.js library/react/react.production.min.js "react.production.min.js" || status=1
check_file node_modules/react-dom/umd/react-dom.production.min.js library/react/react-dom.production.min.js "react-dom.production.min.js" || status=1

# tesseract
check_file node_modules/tesseract.js/dist/tesseract.min.js library/tesseract/tesseract.min.js "tesseract.min.js" || status=1
check_file node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js library/tesseract/tesseract-core-simd-lstm.wasm.js "tesseract-core-simd-lstm.wasm.js" || status=1
check_file node_modules/tesseract.js/dist/worker.min.js library/tesseract/worker.min.js "worker.min.js" || status=1
check_file https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/eng.traineddata library/tesseract/eng.traineddata "eng.traineddata" || status=1

exit $status
