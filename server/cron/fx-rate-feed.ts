/**
 * FX Rate Feed — Daily Ingestion Cron
 *
 * Sources: Frankfurter API (https://www.frankfurter.app)
 * Schedule: 06:00 UTC daily
 * Target table: gl_daily_rates (Drizzle: glDailyRates)
 *
 * Strategy:
 *   1. Fetch rates from Frankfurter for all major currencies
 *   2. Upsert into gl_daily_rates (conflict on from_currency + to_currency + conversion_date)
 *   3. Log summary to admin_logs
 */

import cron from 'node-cron';
import { db } from '../db';
import { glDailyRates } from '../../shared/schema/finance';
import { adminLogs } from '../../shared/schema/admin';

// ---------------------------------------------------------------------------
// Major currencies to fetch (base = USD)
// ---------------------------------------------------------------------------

const MAJOR_CURRENCIES = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'INR', 'BRL', 'MXN', 'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'NZD', 'ZAR', 'KRW', 'TRY', 'RUB', 'AED', 'SAR', 'PLN', 'CZK', 'HUF'];

// ---------------------------------------------------------------------------
// Fetch from Frankfurter
// ---------------------------------------------------------------------------

interface FrankfurterResponse {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

async function fetchDailyRates(): Promise<{ base: string; date: string; rates: Record<string, number> } | null> {
    try {
        const url = `https://api.frankfurter.app/latest?from=USD&to=${MAJOR_CURRENCIES.join(',')}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error(`Frankfurter API returned ${response.status}`);
        const data: FrankfurterResponse = await response.json();
        return { base: data.base, date: data.date, rates: data.rates };
    } catch (err: any) {
        console.error('[FxRateFeed] Failed to fetch rates:', err.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Upsert into gl_daily_rates
// ---------------------------------------------------------------------------

async function upsertRates(base: string, date: string, rates: Record<string, number>): Promise<number> {
    const conversionDate = new Date(date);
    let upserted = 0;

    for (const [toCurrency, rate] of Object.entries(rates)) {
        try {
            await db
                .insert(glDailyRates)
                .values({
                    fromCurrency: base,
                    toCurrency,
                    conversionDate,
                    conversionType: 'Spot',
                    rate: String(rate),
                } as any)
                .onConflictDoUpdate({
                    target: [glDailyRates.fromCurrency, glDailyRates.toCurrency, glDailyRates.conversionDate],
                    set: { rate: String(rate) } as any,
                });
            upserted++;

            // Also insert the inverse rate (toCurrency → base)
            const inverseRate = 1 / rate;
            await db
                .insert(glDailyRates)
                .values({
                    fromCurrency: toCurrency,
                    toCurrency: base,
                    conversionDate,
                    conversionType: 'Spot',
                    rate: String(inverseRate.toFixed(10)),
                } as any)
                .onConflictDoUpdate({
                    target: [glDailyRates.fromCurrency, glDailyRates.toCurrency, glDailyRates.conversionDate],
                    set: { rate: String(inverseRate.toFixed(10)) } as any,
                });
            upserted++;
        } catch (err: any) {
            console.error(`[FxRateFeed] Upsert failed for ${base}→${toCurrency}:`, err.message);
        }
    }

    return upserted;
}

// ---------------------------------------------------------------------------
// Main Ingestion Run
// ---------------------------------------------------------------------------

export async function runFxRateFeedIngestion(): Promise<void> {
    console.log('[FxRateFeed] Starting daily FX rate ingestion...');
    const start = Date.now();

    const data = await fetchDailyRates();
    if (!data) {
        console.warn('[FxRateFeed] Skipping — no data fetched');
        return;
    }

    const count = await upsertRates(data.base, data.date, data.rates);
    const duration = Date.now() - start;
    console.log(`[FxRateFeed] ✅ Ingested ${count} rates for ${data.date} in ${duration}ms`);

    // Write summary to admin_logs
    try {
        await db.insert(adminLogs as any).values({
            actorType: 'system',
            action: 'FX_RATE_FEED_RUN',
            resourceType: 'gl_daily_rates',
            intent: `Daily FX rate ingestion from Frankfurter API`,
            details: `Upserted ${count} rates for date ${data.date} in ${duration}ms`,
            afterState: { count, date: data.date, base: data.base, currencies: Object.keys(data.rates) },
        });
    } catch (_) {
        // Non-fatal — audit failure should not abort FX feed
    }
}

// ---------------------------------------------------------------------------
// Cron Scheduler
// ---------------------------------------------------------------------------

let _cronTask: ReturnType<typeof cron.schedule> | null = null;

export function startFxRateFeedCron() {
    if (_cronTask) {
        console.warn('[FxRateFeed] Cron already running');
        return;
    }

    // Run immediately on startup, then daily at 06:00 UTC
    runFxRateFeedIngestion().catch(console.error);

    _cronTask = cron.schedule('0 6 * * *', () => {
        runFxRateFeedIngestion().catch(console.error);
    }, { timezone: 'UTC' });

    console.log('[FxRateFeed] Scheduled daily at 06:00 UTC');
}

export function stopFxRateFeedCron() {
    _cronTask?.stop();
    _cronTask = null;
}
