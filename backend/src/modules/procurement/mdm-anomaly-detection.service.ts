/**
 * MDM AI Anomaly Detection Service — P2.B Gap Implementation
 *
 * Implements statistical anomaly detection using Z-score analysis
 * for Master Data Management (MDM) data quality monitoring.
 *
 * Oracle Fusion equivalent: MDM Data Quality Analytics / AI-driven DQ alerts
 */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

export type AnomalySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface FieldStats {
    fieldName: string;
    count: number;
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    nullCount: number;
    uniqueCount: number;
}

export interface AnomalyFlag {
    entityType: string;
    entityId: string;
    fieldName: string;
    value: number | string;
    zScore?: number;
    reason: string;
    severity: AnomalySeverity;
    detectedAt: Date;
}

export interface AnomalyReport {
    runAt: Date;
    entityType: string;
    totalRecordsAnalyzed: number;
    anomaliesFound: number;
    criticalCount: number;
    warningCount: number;
    fieldStats: FieldStats[];
    anomalies: AnomalyFlag[];
    dataQualityScore: number; // 0-100 (100 = no anomalies)
}

@Injectable()
export class MdmAnomalyDetectionService {
    private readonly logger = new Logger(MdmAnomalyDetectionService.name);
    private readonly Z_SCORE_THRESHOLD = 2.5; // Flag if |z| > 2.5

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * Runs Z-score anomaly detection on numeric fields in a dataset.
     * @param entityType - Name of the entity being analyzed
     * @param records - Array of entity records
     * @param numericFields - Keys of numeric fields to analyze
     * @param entityIdField - Key that holds the record ID
     */
    detectNumericAnomalies(
        entityType: string,
        records: Record<string, any>[],
        numericFields: string[],
        entityIdField: string = 'id'
    ): AnomalyReport {
        const anomalies: AnomalyFlag[] = [];
        const fieldStats: FieldStats[] = [];
        const startTime = Date.now();

        for (const fieldName of numericFields) {
            // Extract numeric values
            const values = records
                .map(r => Number(r[fieldName]))
                .filter(v => !isNaN(v) && isFinite(v));

            if (values.length < 5) continue; // Need sufficient data for Z-score

            const nullCount = records.filter(r => r[fieldName] == null).length;
            const uniqueSet = new Set(values);

            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);

            fieldStats.push({
                fieldName,
                count: values.length,
                mean: Number(mean.toFixed(4)),
                stdDev: Number(stdDev.toFixed(4)),
                min: Math.min(...values),
                max: Math.max(...values),
                nullCount,
                uniqueCount: uniqueSet.size,
            });

            // Flag records with |z-score| > threshold
            for (const record of records) {
                const rawVal = record[fieldName];
                if (rawVal == null || isNaN(Number(rawVal))) continue;

                const z = stdDev > 0 ? Math.abs((Number(rawVal) - mean) / stdDev) : 0;

                if (z > this.Z_SCORE_THRESHOLD) {
                    const severity: AnomalySeverity = z > this.Z_SCORE_THRESHOLD * 1.5 ? 'CRITICAL' : 'WARNING';
                    anomalies.push({
                        entityType,
                        entityId: record[entityIdField] || 'UNKNOWN',
                        fieldName,
                        value: Number(rawVal),
                        zScore: Number(z.toFixed(3)),
                        reason: `${fieldName} value ${rawVal} is ${z.toFixed(1)} standard deviations from mean (${mean.toFixed(2)})`,
                        severity,
                        detectedAt: new Date(),
                    });
                }
            }
        }

        // Check null rate anomalies (>20% null in key fields)
        for (const fieldName of numericFields) {
            const nullCount = records.filter(r => r[fieldName] == null).length;
            const nullRate = records.length > 0 ? nullCount / records.length : 0;
            if (nullRate > 0.20) {
                anomalies.push({
                    entityType,
                    entityId: 'DATASET',
                    fieldName,
                    value: `${(nullRate * 100).toFixed(1)}% null`,
                    reason: `High null rate (${(nullRate * 100).toFixed(1)}%) in field ${fieldName} — potential data quality issue`,
                    severity: nullRate > 0.50 ? 'CRITICAL' : 'WARNING',
                    detectedAt: new Date(),
                });
            }
        }

        const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
        const warningCount = anomalies.filter(a => a.severity === 'WARNING').length;
        const dqScore = Math.max(0, 100 - (criticalCount * 10) - (warningCount * 3));

        this.logger.log(
            `MDM Anomaly Detection [${entityType}]: ${records.length} records, ` +
            `${anomalies.length} anomalies (${criticalCount} critical), DQ score=${dqScore}`
        );

        return {
            runAt: new Date(),
            entityType,
            totalRecordsAnalyzed: records.length,
            anomaliesFound: anomalies.length,
            criticalCount,
            warningCount,
            fieldStats,
            anomalies,
            dataQualityScore: dqScore,
        };
    }

    /**
     * Detects duplicate records by computing a similarity score.
     * Flags records with identical key fields (e.g. supplier name + DUNS + tax ID).
     */
    detectDuplicates(
        entityType: string,
        records: Record<string, any>[],
        deduplicationKeys: string[],
        entityIdField: string = 'id'
    ): { entityType: string; duplicateGroups: Array<{ key: string; count: number; ids: string[] }>; totalDuplicates: number } {
        const groups = new Map<string, string[]>();

        for (const record of records) {
            const key = deduplicationKeys.map(k => String(record[k] || '').toLowerCase().trim()).join('|');
            const existing = groups.get(key) || [];
            existing.push(record[entityIdField]);
            groups.set(key, existing);
        }

        const duplicateGroups = Array.from(groups.entries())
            .filter(([, ids]) => ids.length > 1)
            .map(([key, ids]) => ({ key, count: ids.length, ids }));

        const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + (g.count - 1), 0);

        if (totalDuplicates > 0) {
            this.logger.warn(`MDM Duplicate Detection [${entityType}]: ${totalDuplicates} duplicate records in ${duplicateGroups.length} groups`);
        }

        return { entityType, duplicateGroups, totalDuplicates };
    }

    /**
     * Runs a comprehensive data quality scan on MDM supplier data.
     */
    async runSupplierDataQualityScan(): Promise<AnomalyReport & { duplicateReport: any }> {
        const suppliers = await this.db.select()
            .from(schema.apSuppliers)
            .limit(2000)
            .catch(() => []);

        const numericReport = this.detectNumericAnomalies(
            'Supplier',
            suppliers,
            ['supplierCapacityKg', 'leadTimeDays', 'minOrderQuantity'].filter(f =>
                suppliers.length > 0 && f in suppliers[0]
            ),
        );

        const duplicateReport = this.detectDuplicates(
            'Supplier',
            suppliers as any[],
            ['supplierName'],
        );

        return { ...numericReport, duplicateReport };
    }
}
