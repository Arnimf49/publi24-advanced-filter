const EXACT_MATCH_LABELS = ['Potriviri exacte', 'Exact matches'];

function isRendered(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getExactMatchTextElement(): HTMLElement | null {
  const xpath = "//span[normalize-space(.)='Potriviri exacte' or normalize-space(.)='Exact matches']";
  const snapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  let firstMatch: HTMLElement | null = null;

  for (let index = 0; index < snapshot.snapshotLength; index++) {
    const element = snapshot.snapshotItem(index);

    if (!(element instanceof HTMLElement)) {
      continue;
    }

    firstMatch ??= element;

    // Lens keeps hidden pre-render copies of the tabs. Clicking those does
    // nothing, so always prefer the rendered tab.
    if (isRendered(element)) {
      return element;
    }
  }

  return firstMatch;
}

function getExactMatchAnchor(): HTMLAnchorElement | null {
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'))
    .filter(anchor => EXACT_MATCH_LABELS.includes(anchor.textContent?.trim() ?? ''));

  const visible = anchors.find(isRendered);
  return visible ?? anchors[0] ?? null;
}

function getExactMatchHref(): string | null {
  const href = getExactMatchAnchor()?.getAttribute('href') ?? '';
  return href ? href : null;
}

function isExactMatchSelected(element: HTMLElement): boolean {
  return element.parentElement?.hasAttribute('selected') ?? false;
}

function isExactMatchActionable(element: HTMLElement): boolean {
  if (!isRendered(element)) {
    return false;
  }

  if (isExactMatchSelected(element)) {
    return true;
  }

  const anchor = element.closest('a');
  return !!anchor?.getAttribute('href') && anchor.getAttribute('aria-disabled') !== 'true';
}

function isLensThinking(): boolean {
  return Array.from(document.querySelectorAll('[role="heading"]'))
    .some(heading => /Se gândește|Încă mă gândesc|Thinking/i.test(heading.textContent ?? ''));
}

export const lensPage = {
  getExactMatchTextElement,
  getExactMatchAnchor,
  getExactMatchHref,
  isExactMatchSelected,
  isExactMatchActionable,
  isLensThinking,
};
