import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Initialize state with the locally stored value if it exists, or the initial value
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that persists the new value
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                // Dispatch custom event to sync other useLocalStorage hooks in the same tab
                window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        // Handle cross-tab synchronization
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                try {
                    if (e.newValue) {
                        setStoredValue(JSON.parse(e.newValue));
                    } else {
                        setStoredValue(initialValue);
                    }
                } catch (error) {
                    console.warn(`Error handling localStorage synchronization for key "${key}":`, error);
                }
            }
        };

        // Handle same-tab synchronization
        const handleCustomStorageChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.key === key) {
                try {
                    const item = window.localStorage.getItem(key);
                    if (item) {
                        setStoredValue(JSON.parse(item));
                    } else {
                        setStoredValue(initialValue);
                    }
                } catch (error) {
                    console.warn(`Error handling custom localStorage synchronization for key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleCustomStorageChange);
        };
    }, [key, initialValue]);

    return [storedValue, setValue] as const;
}
