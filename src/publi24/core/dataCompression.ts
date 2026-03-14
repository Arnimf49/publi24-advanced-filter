const dataCompression = {
  compressAdLink(url: string): string {
    const match = url.match(/https:\/\/www\.publi24\.ro\/anunturi\/(.*)\/anunt\/[^/]+\/([^.]+)\.html/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return url;
  },

  decompressAdLink(compressed: string): string {
    if (compressed.startsWith('http')) {
      return compressed;
    }
    const parts = compressed.split('/');
    if (parts.length >= 2) {
      const id = parts[parts.length - 1];
      const path = parts.slice(0, -1).join('/');
      return `https://www.publi24.ro/anunturi/${path}/anunt/titlu-sters/${id}.html`;
    }
    return compressed;
  }
}

export {dataCompression};
