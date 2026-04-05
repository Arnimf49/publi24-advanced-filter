import {supabaseClient} from './supabaseClient';
import {userId} from '../userId';

const FEEDBACK_STORAGE_KEY = 'ww:feedback-sent-today';
const DAILY_LIMIT = 3;

interface FeedbackRecord {
  timestamps: number[];
}

function getFeedbackRecord(): FeedbackRecord {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { timestamps: [] };
}

function saveFeedbackRecord(record: FeedbackRecord): void {
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(record));
}

export const feedbackClient = {
  getRemainingToday(): number {
    const record = getFeedbackRecord();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentCount = record.timestamps.filter(t => t > oneDayAgo).length;
    return Math.max(0, DAILY_LIMIT - recentCount);
  },

  async send(message: string): Promise<{ success: boolean; error?: string }> {
    const uid = userId.get();
    if (!uid) {
      return { success: false, error: 'User ID not available.' };
    }

    if (this.getRemainingToday() <= 0) {
      return { success: false, error: 'Ai atins limita de 3 mesaje pe zi.' };
    }

    try {
      const response = await supabaseClient.request('/rest/v1/feedback_v1', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id: uid, message }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Feedback send failed:', response.status, text);
        return { success: false, error: 'Eroare la trimitere. Încearcă din nou.' };
      }

      const record = getFeedbackRecord();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      record.timestamps = record.timestamps.filter(t => t > oneDayAgo);
      record.timestamps.push(Date.now());
      saveFeedbackRecord(record);

      return { success: true };
    } catch (e) {
      console.error('Feedback send error:', e);
      return { success: false, error: 'Eroare de rețea. Încearcă din nou.' };
    }
  },
};
