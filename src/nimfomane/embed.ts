const DARK_MODE_KEY = 'p24fa:nimfo:dark_mode';
const DARK_CLASS = 'nimfo-embed-dark';
const STYLE_ID = 'nimfo-embed-dark-style';

const EMBED_CSS = `
html.${DARK_CLASS} {
  color-scheme: dark;
  background: #181b21;
}

html.${DARK_CLASS} body {
  background: #181b21;
  color: #c4c9d2;
}

html.${DARK_CLASS} .ipsRichEmbed {
  color: #c4c9d2;
}

html.${DARK_CLASS} .ipsRichEmbed a {
  color: #8fb3ef;
}

html.${DARK_CLASS} .ipsRichEmbed_header {
  background: #20242c;
  color: #e8ecf3;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

html.${DARK_CLASS} .ipsRichEmbed_openItem {
  color: #8fb3ef;
}

html.${DARK_CLASS} .ipsUserPhoto {
  background: #2a2d33;
}

html.${DARK_CLASS} .ipsRichEmbed_author,
html.${DARK_CLASS} .ipsRichEmbed_author a,
html.${DARK_CLASS} .ipsRichEmbed_stats a {
  color: #8f96a3;
}

html.${DARK_CLASS} .ipsRichEmbed_stats {
  border-top-color: rgba(255, 255, 255, 0.08);
}
`;

const isEmbedFrame = (): boolean => {
  return window.top !== window || window.location.search.includes('do=embed');
};

const apply = (): void => {
  const enabled = localStorage.getItem(DARK_MODE_KEY) === 'true';
  const root = document.documentElement;
  const existingStyle = document.getElementById(STYLE_ID);

  root.classList.toggle(DARK_CLASS, enabled);

  if (!enabled) {
    existingStyle?.remove();
    return;
  }

  if (existingStyle) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = EMBED_CSS;
  (document.head || document.documentElement).appendChild(style);
};

if (isEmbedFrame()) {
  apply();
  window.addEventListener('storage', event => {
    if (event.key === DARK_MODE_KEY) {
      apply();
    }
  });
}
