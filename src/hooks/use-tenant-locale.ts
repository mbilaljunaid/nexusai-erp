import { useMemo } from "react";
import { i18n } from "@/lib/i18n";

/**
 * Returns the tenant-aware locale, currency, and date format settings
 * sourced from the application's i18n configuration.
 *
 * All formatting utilities accept these values as optional overrides, with
 * `en-US` / `USD` as safe fallbacks for development and demo environments.
 *
 * Usage:
 *   const { locale, currency, dateFormat } = useTenantLocale();
 *   formatCurrency(amount, currency, locale);
 *   formatNumber(qty, 0, locale);
 *   format(date, dateFormat);     // date-fns
 */
export function useTenantLocale() {
    return useMemo(() => {
        const config = i18n.getConfig();

        // Map i18n language + region to a BCP-47 locale tag (e.g. "en" → "en-US")
        const language = config.language ?? "en";
        const region = (config as any).region ?? "US";
        const locale = `${language}-${region}`;     // e.g. "en-US", "fr-FR", "ar-AE"

        const currency = config.currency ?? "USD";
        const dateFormat = getDateFormat(language, region);

        return { locale, currency, dateFormat } as const;
    }, []);
}

/**
 * Returns a date-fns compatible format string for the given locale.
 * Follows ISO and regional conventions.
 */
function getDateFormat(language: string, region: string): string {
    // Middle East / Islamic calendar countries
    if (["AE", "SA", "QA", "KW", "BH", "OM"].includes(region)) return "dd/MM/yyyy";
    // East Asia
    if (["CN", "JP", "KR", "TW"].includes(region)) return "yyyy/MM/dd";
    // Continental Europe
    if (["DE", "FR", "ES", "IT", "NL", "PL", "AT", "CH"].includes(region)) return "dd.MM.yyyy";
    // UK / Commonwealth
    if (["GB", "AU", "NZ", "IN", "ZA"].includes(region)) return "dd/MM/yyyy";
    // US default
    return "MM/dd/yyyy";
}
