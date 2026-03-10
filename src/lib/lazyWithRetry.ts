import { lazy, ComponentType } from "react";

/**
 * Wraps React.lazy with retry logic for stale chunk errors.
 * When a dynamic import fails (e.g., after a rebuild changes chunk hashes),
 * it reloads the page once to fetch the new assets.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const hasRefreshed = sessionStorage.getItem("chunk_retry");
    try {
      const module = await importFn();
      sessionStorage.removeItem("chunk_retry");
      return module;
    } catch (error) {
      if (!hasRefreshed) {
        sessionStorage.setItem("chunk_retry", "1");
        window.location.reload();
      }
      throw error;
    }
  });
}
