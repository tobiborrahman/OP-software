// useDebounce.ts
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  // State to store debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if value or delay changes
    return () => clearTimeout(handler);
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

export default useDebounce;
