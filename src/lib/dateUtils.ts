import { format, isValid, parseISO } from 'date-fns';

/**
 * Safely parses and formats a date string or Date object.
 * Returns a fallback string (default: '—') if the input is invalid or null.
 */
export function formatDate(
    date: string | number | Date | null | undefined,
    formatStr: string = 'MMM d, yyyy',
    fallback: string = '—'
): string {
    if (!date) return fallback;

    const parsedDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (!isValid(parsedDate)) {
        // If parseISO fails, try standard Date constructor as fallback for non-ISO strings
        const fallbackDate = new Date(date);
        if (!isValid(fallbackDate)) return fallback;
        return format(fallbackDate, formatStr);
    }

    return format(parsedDate, formatStr);
}

/**
 * Formats a date including time.
 */
export function formatDateTime(
    date: string | number | Date | null | undefined,
    fallback: string = '—'
): string {
    return formatDate(date, 'MMM d, yyyy h:mm a', fallback);
}

/**
 * Formats only the time portion of a date.
 */
export function formatTime(
    date: string | number | Date | null | undefined,
    fallback: string = '—'
): string {
    return formatDate(date, 'h:mm a', fallback);
}
