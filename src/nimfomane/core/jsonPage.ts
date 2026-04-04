import {page} from "../../common/page";

function buildJsonUrl(url: string): string {
  const csrfKey = document.querySelector<HTMLInputElement>('[name="csrfKey"]')?.value;
  if (!csrfKey) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}csrfKey=${encodeURIComponent(csrfKey)}`;
}

export const jsonPage = {
  load(url: string, options?: { priority?: number }): Promise<Document> {
    return page.load(buildJsonUrl(url), {
      priority: options?.priority,
      json: { htmlInKey: 'rows' },
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
  }
};
