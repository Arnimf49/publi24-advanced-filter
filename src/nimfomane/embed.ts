const DARK_MODE_KEY = 'p24fa:nimfo:dark_mode';
const DARK_CLASS = 'nimfo-embed-dark';
const STYLE_ID = 'nimfo-embed-dark-style';

const EMBED_CSS = `
/* The embed iframe document has neither the main theme's \`html#focus.dark\`
 * scope nor its stylesheet, so the framework falls back to its light palette.
 * Re-declare the dark palette here; every framework surface resolves
 * through these variables (body, .ipsAreaBackground_*, #ipsEmbedLoading). */
html.${DARK_CLASS} {
  color-scheme: dark;

  --theme-page_background: 18, 20, 25;
  --theme-area_background_reset: 24, 26, 31;
  --theme-area_background_light: 39, 44, 53;
  --theme-area_background: 44, 50, 60;
  --theme-area_background_dark: 24, 26, 30;
  --theme-text_color: 196, 201, 210;
  --theme-text_dark: 238, 241, 246;
  --theme-text_light: 145, 152, 165;
  --theme-text_very_light: 250, 251, 253;
  --theme-link: 224, 229, 236;
  --theme-link_hover: 250, 251, 253;
  --box--backgroundColor: rgb(32, 36, 44);

  background: #181b21;
}

html.${DARK_CLASS} body {
  background: #181b21;
  color: #c4c9d2;
}

html.${DARK_CLASS} .ipsAreaBackground_reset {
  background-color: var(--box--backgroundColor);
}

/* The framework's loading overlay is painted by body.unloaded #ipsEmbedLoading;
 * match its specificity so the dark surface wins. */
html.${DARK_CLASS} body.unloaded #ipsEmbedLoading {
  background: #181b21;
  border-color: rgba(255, 255, 255, 0.08);
}

html.${DARK_CLASS} .ipsRichEmbed {
  color: #c4c9d2;
}

html.${DARK_CLASS} .ipsRichEmbed a {
  color: #8fb3ef;
}

html.${DARK_CLASS} .ipsRichEmbed_header {
  background: #131518;
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
