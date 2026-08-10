import {RefObject, useEffect, useRef, useState} from 'react';

const useDemoVisibility = (elementRef: RefObject<HTMLElement>, startDelay = 4000, startImmediately = false): boolean => {
  const [isActive, setIsActive] = useState(false);
  const hasStartedRef = useRef(false);

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
      if (entry.isIntersecting) {
        if (hasStartedRef.current || startImmediately) {
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

      setIsActive(false);
    }, {threshold: 0});

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
