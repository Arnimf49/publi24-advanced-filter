import React, { useState } from 'react';
import GeneralModal from '../Modal/GeneralModal';
import styles from './FeedbackModal.module.scss';
import { feedbackClient } from '../../supabase/feedbackClient';
import { InlineLoader } from '../InlineLoader/InlineLoader';

const MAX_CHARS = 700;

type FeedbackModalProps = {
  onClose: () => void;
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const remaining = feedbackClient.getRemainingToday();
  const charCount = message.length;
  const isOver = charCount > MAX_CHARS;
  const canSend = !isSending && !success && charCount > 0 && !isOver && remaining > 0;

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    setError(null);
    const result = await feedbackClient.send(message.trim());
    setIsSending(false);
    if (result.success) {
      setSuccess(true);
      setMessage('');
    } else {
      setError(result.error || 'Eroare necunoscută.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  return (
    <GeneralModal title="Feedback" onClose={onClose} maxWidth={600} dataWwid="feedback-modal" prose={false}>
      <div className={styles.body}>
        <p className={styles.description}>
          Ai găsit un bug? Ai o idee de îmbunătățire sau o sugestie? Scrie aici.
        </p>

        {success ? (
          <p className={styles.successMessage}>Mesajul a fost trimis.</p>
        ) : (
          <>
            {remaining <= 0 ? (
              <p className={styles.errorMessage}>
                Ai atins limita de 3 mesaje pe zi. Revino mâine!
              </p>
            ) : (
              <>
                <textarea
                  className={styles.textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Descrie bug-ul, îmbunătățirea sau ideea ta..."
                  disabled={isSending}
                  autoFocus
                />
                <span className={`${styles.charCount} ${isOver ? styles.over : ''}`}>
                  {charCount} / {MAX_CHARS}
                </span>
                {error && <p className={styles.errorMessage}>{error}</p>}
              </>
            )}
          </>
        )}
      </div>

      <div className={styles.footer}>
        {!success && remaining > 0 && (
          <button
            type="button"
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!canSend}
            title="Ctrl+Enter"
          >
            {isSending
              ? <InlineLoader color="#fff" trackColor="rgba(255,255,255,0.3)" size={16}/>
              : 'Trimite'
            }
          </button>
        )}
      </div>
    </GeneralModal>
  );
};

export default FeedbackModal;
