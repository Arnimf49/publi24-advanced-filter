import type { PublicState, StashListItem, StashedRun } from './types';

const fetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const mapperClient = {
  fetchJson,
  navigateTo: (url: string) =>
    fetchJson<{ ok: boolean; opened: string }>('/api/browser/navigate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  focusDomain: (domain: string) =>
    fetchJson<{ ok: boolean }>(`/api/browser/focus/${encodeURIComponent(domain)}`, { method: 'POST' }),
  fetchStashList: () =>
    fetchJson<StashListItem[]>('/api/stash'),
  fetchStashedRun: (domain: string) =>
    fetchJson<StashedRun>(`/api/stash/${encodeURIComponent(domain)}`),
  stashAccept: (domain: string) =>
    fetchJson<PublicState>(`/api/stash/${encodeURIComponent(domain)}/accept`, { method: 'POST' }),
  stashOverride: (domain: string, body: { verdict: string; country: string | null; reasoning?: string }) =>
    fetchJson<PublicState>(`/api/stash/${encodeURIComponent(domain)}/override`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  stashDiscard: (domain: string) =>
    fetchJson<PublicState>(`/api/stash/${encodeURIComponent(domain)}/discard`, { method: 'POST' }),
  stashRetry: (domain: string) =>
    fetchJson<PublicState>(`/api/stash/${encodeURIComponent(domain)}/retry`, { method: 'POST' }),
};
