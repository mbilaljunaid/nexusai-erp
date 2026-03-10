import { Request, Response } from 'express';

interface FxRateRow {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    conversionDate: string;
}

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export class FxRateCsvService {
    /**
     * Parse and validate CSV file for FX rates
     * Expected format: FromCurrency,ToCurrency,Rate,Date
     */
    async parseCsvFile(csvContent: string): Promise<{
        valid: FxRateRow[];
        invalid: ValidationError[];
    }> {
        const valid: FxRateRow[] = [];
        const invalid: ValidationError[] = [];

        try {
            // Simple CSV parsing - split by newlines and parse each row
            const lines = csvContent.split('\n').filter(line => line.trim());

            if (lines.length === 0) {
                throw new Error('CSV file is empty');
            }

            const headers = lines[0].split(',').map(h => h.trim());

            // Validate header format
            if (!headers.includes('FromCurrency') || !headers.includes('ToCurrency') ||
                !headers.includes('Rate') || !headers.includes('Date')) {
                throw new Error('CSV must have headers: FromCurrency,ToCurrency,Rate,Date');
            }

            // Parse each data row (skip header)
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const record: Record<string, string> = {};

                headers.forEach((header, idx) => {
                    record[header] = values[idx] || '';
                });

                const rowNumber = i + 1; // 1-indexed for display
                const errors: ValidationError[] = [];

                // Validate fromCurrency
                if (!record.FromCurrency || record.FromCurrency.length !== 3) {
                    errors.push({
                        row: rowNumber,
                        field: 'FromCurrency',
                        message: 'Must be 3-letter currency code'
                    });
                }

                // Validate toCurrency
                if (!record.ToCurrency || record.ToCurrency.length !== 3) {
                    errors.push({
                        row: rowNumber,
                        field: 'ToCurrency',
                        message: 'Must be 3-letter currency code'
                    });
                }

                // Validate rate
                const rate = parseFloat(record.Rate);
                if (isNaN(rate) || rate <= 0) {
                    errors.push({
                        row: rowNumber,
                        field: 'Rate',
                        message: 'Must be positive number'
                    });
                }

                // Validate date
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!record.Date || !dateRegex.test(record.Date)) {
                    errors.push({
                        row: rowNumber,
                        field: 'Date',
                        message: 'Must be YYYY-MM-DD format'
                    });
                }

                if (errors.length > 0) {
                    invalid.push(...errors);
                } else {
                    valid.push({
                        fromCurrency: record.FromCurrency.toUpperCase(),
                        toCurrency: record.ToCurrency.toUpperCase(),
                        rate: rate,
                        conversionDate: record.Date
                    });
                }
            }

            return { valid, invalid };
        } catch (error: any) {
            throw new Error(`CSV parsing failed: ${error.message}`);
        }
    }

    /**
     * Bulk insert FX rates into database
     */
    async bulkInsertRates(rates: FxRateRow[], db: any): Promise<number> {
        let inserted = 0;

        for (const rate of rates) {
            try {
                // Check if rate already exists for this date
                const existing = await db('gl_daily_rates')
                    .where({
                        from_currency: rate.fromCurrency,
                        to_currency: rate.toCurrency,
                        conversion_date: rate.conversionDate
                    })
                    .first();

                if (existing) {
                    // Update existing rate
                    await db('gl_daily_rates')
                        .where({ id: existing.id })
                        .update({
                            conversion_rate: rate.rate,
                            rate_type: 'DAILY',
                            updated_at: new Date()
                        });
                } else {
                    // Insert new rate
                    await db('gl_daily_rates').insert({
                        from_currency: rate.fromCurrency,
                        to_currency: rate.toCurrency,
                        conversion_rate: rate.rate,
                        conversion_date: rate.conversionDate,
                        rate_type: 'DAILY',
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
                inserted++;
            } catch (error: any) {
                console.error(`[FX_CSV] Failed to insert rate ${rate.fromCurrency}-${rate.toCurrency}:`, error);
            }
        }

        return inserted;
    }

    /**
     * Express handler for CSV upload
     */
    async handleCsvUpload(req: Request, res: Response, db: any) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const csvContent = req.file.buffer.toString('utf-8');
            const { valid, invalid } = await this.parseCsvFile(csvContent);

            if (invalid.length > 0) {
                return res.status(400).json({
                    error: 'Validation errors found',
                    errors: invalid,
                    validCount: valid.length,
                    invalidCount: invalid.length
                });
            }

            const inserted = await this.bulkInsertRates(valid, db);

            res.json({
                success: true,
                inserted,
                totalRows: valid.length,
                message: `Successfully imported ${inserted} FX rates`
            });
        } catch (error: any) {
            console.error('[FX_CSV] Upload error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Generate CSV template for download
     */
    generateTemplate(): string {
        const header = 'FromCurrency,ToCurrency,Rate,Date';
        const examples = [
            'EUR,USD,1.0800,2026-02-11',
            'GBP,USD,1.2700,2026-02-11',
            'JPY,USD,0.0067,2026-02-11'
        ];
        return [header, ...examples].join('\n');
    }
}
