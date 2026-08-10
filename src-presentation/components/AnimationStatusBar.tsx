import React, {useEffect, useState} from 'react';
import styles from './AnimationStatusBar.module.scss';

type AnimationStatusBarProps = {
  duration: number;
  resetKey: string | number;
  onRestart: () => void;
  onPlay?: () => void;
  onPauseChange?: (paused: boolean) => void;
  isPaused?: boolean;
};

const AnimationStatusBar: React.FC<AnimationStatusBarProps> = ({duration, resetKey, onRestart, onPlay, onPauseChange, isPaused = false}) => {
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const animationIsPaused = isPaused || isManuallyPaused;

  useEffect(() => {
    setIsManuallyPaused(false);
    onPauseChange?.(false);
  }, [resetKey]);

  return (
    <div className={styles.statusBar}>
      <button
        type="button"
        className={styles.controlButton}
        onClick={() => {
          if (isPaused && onPlay) {
            onPlay();
            return;
          }

          setIsManuallyPaused((paused) => {
            const nextPaused = !paused;
            onPauseChange?.(nextPaused);
            return nextPaused;
          });
        }}
        aria-label={animationIsPaused ? 'Pornește animația' : 'Pune pauză animației'}
        title={animationIsPaused ? 'Pornește animația' : 'Pune pauză animației'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {animationIsPaused ? (
            <path d="m9 6 9 6-9 6V6Z" fill="currentColor" />
          ) : (
            <>
              <path d="M7 5h3v14H7z" fill="currentColor" />
              <path d="M14 5h3v14h-3z" fill="currentColor" />
            </>
          )}
        </svg>
      </button>
      <div className={styles.track}>
        <span
          key={resetKey}
          className={styles.fill}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: animationIsPaused ? 'paused' : 'running',
          }}
        />
      </div>
      <button
        type="button"
        className={styles.restartButton}
        onClick={onRestart}
        aria-label="Repornește animația"
        title="Repornește animația"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11a8 8 0 1 0 1 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M20 5v6h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
};

export default AnimationStatusBar;
