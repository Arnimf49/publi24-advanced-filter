import {browserApi} from "../../common/globals";

declare const Jimp: any;
declare const Tesseract: any;
declare const QRCode: any;

export const misc = {
  cx(...args: (string | boolean | undefined | null)[]): string {
    return args.filter(Boolean).join(' ');
  },

  async readNumbersFromBase64Png(data: string): Promise<string> {
    const TESSERACT_PATH = `/library/tesseract/`;
    const runtime = browserApi.runtime;

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
        QRCode.toDataURL(`tel:${phone}`, {
          color: misc.getPubliTheme() === 'dark' ? {
            dark: '#bfbfbf',
            light: '#28292a',
          } : null},  (err: Error | null | undefined, url: string | undefined) => {
            if (err) {
              rej(err);
            } else if (url) {
              res(url);
            } else {
              rej(new Error('QR Code generation returned undefined URL without error.'));
            }
          }
        );
      } catch (error) {
        rej(error);
      }
    });
  },

  getPubliTheme(): 'dark' | 'light' {
    const theme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null || 'system';
    return theme === 'system'
      ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
  }
};
