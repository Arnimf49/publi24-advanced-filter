export const elementHelpers = {
  isUserLinkEscort (a: HTMLLinkElement) {
    return a.querySelector('[color]')?.getAttribute('color')?.toLowerCase() === '#ff0000';
  },

  isProfilePageEscort(page: HTMLElement | Document = document) {
    const typeContainer = page.querySelector<HTMLElement>('span .ipsPageHead_barText');
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
