/**
 * Global utility for consistent currency, number, and percentage formatting
 * Used across the NexusAI ERP to ensure standard display logic and handle nulls safely.
 */

export const formatCurrency = (
    value: number | string | null | undefined,
    currency = 'USD',
    locale = 'en-US'
): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num == null || isNaN(num)) return '—';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

export const formatNumber = (
    value: number | string | null | undefined,
    decimals = 0,
    locale = 'en-US'
): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num == null || isNaN(num)) return '—';

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};

export const formatPercent = (
    value: number | string | null | undefined,
    decimals = 1
): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num == null || isNaN(num)) return '—';

    return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};
