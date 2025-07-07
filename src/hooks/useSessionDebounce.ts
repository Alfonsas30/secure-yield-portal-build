import { useCallback, useRef } from 'react';

export function useSessionDebounce(delay: number = 3000) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCall = useCallback((callback: () => Promise<void>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback().catch(error => {
        console.error('Debounced session call failed:', error);
      });
    }, delay);
  }, [delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return { debouncedCall, cancel };
}