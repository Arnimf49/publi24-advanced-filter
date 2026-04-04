import React, {useCallback, useEffect, useRef, useState} from 'react';
import {adActions} from '../../../core/adActions';
import {InlineLoader} from '../../../../common/components/InlineLoader/InlineLoader';
import styles from './NextVisibleAdButton.module.scss';

const NextVisibleAdButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(false);
  const lastFoundIdRef = useRef<string | null>(null);

  const run = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setLoading(true);
    try {
      const foundId = await adActions.findVisibleAd(lastFoundIdRef.current);
      lastFoundIdRef.current = foundId;
    }
    catch (e) {
      console.error(e);
    }
    finally {
      pendingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, []);

  return (
    <button
      type="button"
      className={styles.nextVisibleAdButton}
      data-wwid="next-visible-ad-global"
      disabled={loading}
      onClick={run}
    >
      <InlineLoader
        size={15}
        spinning={loading}
        color="white"
        trackColor="rgb(223 223 223 / 30%)"
      />
      Următorul &gt;
    </button>
  );
};

export default NextVisibleAdButton;
