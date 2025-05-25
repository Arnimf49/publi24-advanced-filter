declare const Jimp: any;
declare const Tesseract: any;
declare const QRCode: any;

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

export const misc = {
  cx(...args: (string | boolean | undefined | null)[]): string {
    return args.filter(Boolean).join(' ');
  },

  removeDiacritics(text: string): string {
    const diacriticMap: { [key: string]: string } = {
      'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ţ': 'T', 'Ț': 'T',
      'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ţ': 't', 'ț': 't',
    };
    return text.replace(/[ĂÂÎȘŢȚăâîșţț]/g, (match: string): string => diacriticMap[match] || match);
  },

  async readNumbersFromBase64Png(data: string): Promise<string> {
    const TESSERACT_PATH = `/library/tesseract/`;
    const runtime = browser.runtime;

    const jimpImg = await Jimp.read(Buffer.from(data, 'base64'));

    return new Promise<string>((res, rej) => {
      jimpImg.invert()
        .getBase64(Jimp.MIME_PNG, async (err: Error | null, src: string) => {
          if (err) {
            return rej(err);
          }
          let tesseractReader: any;
          try {
            tesseractReader = await Tesseract.createWorker('eng', 1, {
              corePath: runtime.getURL(`${TESSERACT_PATH}tesseract-core-simd-lstm.wasm.js`),
              workerPath: runtime.getURL(`${TESSERACT_PATH}worker.min.js`),
              langPath: runtime.getURL(TESSERACT_PATH),
              gzip: false,
            });
            await tesseractReader.setParameters({tessedit_char_whitelist: '0123456789'});

            const readResult = await tesseractReader.recognize(src);
            res(readResult.data.text.trim());
          } catch (tesseractError) {
            rej(tesseractError);
          } finally {
            if (tesseractReader) {
              await tesseractReader.terminate();
            }
          }
        });
    });
  },

  async getPhoneQrCode(phone: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      try {
        QRCode.toDataURL(`tel:${phone}`, (err: Error | null | undefined, url: string | undefined) => {
          if (err) {
            rej(err);
          } else if (url) {
            res(url);
          } else {
            rej(new Error('QR Code generation returned undefined URL without error.'));
          }
        });
      } catch (error) {
        rej(error);
      }
    });
  },
};
