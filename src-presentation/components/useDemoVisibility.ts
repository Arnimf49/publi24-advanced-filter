import {RefObject, useEffect, useRef, useState} from 'react';

const useDemoVisibility = (
  elementRef: RefObject<HTMLElement>,
  startDelay = 4000,
  startImmediately = false,
  onDeactivate?: () => void,
): boolean => {
  const [isActive, setIsActive] = useState(false);
  const hasStartedRef = useRef(false);
  const onDeactivateRef = useRef(onDeactivate);
  onDeactivateRef.current = onDeactivate;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsActive(true);
      return;
    }

    let startTimeout: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
        if (hasStartedRef.current || startImmediately) {
          hasStartedRef.current = true;
          setIsActive(true);
          return;
        }

        if (window.matchMedia('(max-width: 800px)').matches && entry.intersectionRatio >= 0.9) {
          if (startTimeout !== undefined) {
            window.clearTimeout(startTimeout);
            startTimeout = undefined;
          }

          hasStartedRef.current = true;
          setIsActive(true);
          return;
        }

        if (startTimeout !== undefined) {
          window.clearTimeout(startTimeout);
        }

        startTimeout = window.setTimeout(() => {
          hasStartedRef.current = true;
          setIsActive(true);
        }, startDelay);
        return;
      }

      if (startTimeout !== undefined) {
        window.clearTimeout(startTimeout);
        startTimeout = undefined;
      }

      if (hasStartedRef.current) {
        onDeactivateRef.current?.();
        hasStartedRef.current = false;
      }

      setIsActive(false);
    }, {threshold: [0, 0.4, 0.9]});

    observer.observe(element);

    return () => {
      if (startTimeout !== undefined) {
        window.clearTimeout(startTimeout);
      }
      observer.disconnect();
    };
  }, [elementRef, startDelay, startImmediately]);

  return isActive;
};

export default useDemoVisibility;
