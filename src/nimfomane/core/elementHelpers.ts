export const elementHelpers = {
  isUserLinkEscort (a: HTMLLinkElement) {
    return a.querySelector('[color]')?.getAttribute('color')?.toLowerCase() === '#ff0000';
  },

  isUsePageEscort(page: HTMLElement | Document = document) {
    const typeContainer = page.querySelector<HTMLElement>('.ipsPageHead_barText font');
    return !!typeContainer?.innerText.match(/escort[aă]|neverificat[aă]/i);
  },

  userLinkDestruct(a: HTMLLinkElement): [string, string] {
    return [
      (a.getAttribute('href') as string).replace(/\?.+$/, ''),
      a.innerText === ''
        ? a.querySelector('img')!.getAttribute('alt')!
        : a.innerText
    ];
  }
}
