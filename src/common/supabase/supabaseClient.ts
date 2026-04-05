const SBU_B64 = 'aHR0cHM6Ly9vcWp0eGxiY3R4bnJkZ2pudmdicC5zdXBhYmFzZS5jbw==';
const SBK_B64 = 'c2JfcHVibGlzaGFibGVfX2NtdTdNSzhlcHl5MWJXa1N3TzBFZ193Wl9PaWJaMg==';

export const supabaseClient = {
  get url(): string {
    return atob(SBU_B64);
  },

  get key(): string {
    return atob(SBK_B64);
  },

  async request(path: string, options: RequestInit): Promise<Response> {
    return fetch(`${this.url}${path}`, {
      ...options,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  },
};
