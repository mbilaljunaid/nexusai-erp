import ExcelJS from 'exceljs';
import { Request, Response, NextFunction } from 'express';

export class ConsolidationExportService {
    /**
     * Export consolidation results to Excel
     * Includes: Consolidated balances, entity breakdown, FX adjustments
     */
    async exportResultsToExcel(runId: string): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'NexusAI ERP';
        workbook.created = new Date();

        // Sheet 1: Consolidated Balance Sheet
        const summarySheet = workbook.addWorksheet('Consolidated Summary');
        summarySheet.columns = [
            { header: 'Account', key: 'account', width: 40 },
            { header: 'Pre-Elimination', key: 'preElimination', width: 18 },
            { header: 'Eliminations', key: 'eliminations', width: 18 },
            { header: 'Consolidated', key: 'consolidated', width: 18 }
        ];

        // Mock data - replace with actual DB query
        const consolidatedData = [
            { account: 'Cash and Cash Equivalents', preElimination: 5000000, eliminations: 0, consolidated: 5000000 },
            { account: 'Intercompany Receivables', preElimination: 1000000, eliminations: -1000000, consolidated: 0 },
            { account: 'Fixed Assets', preElimination: 10000000, eliminations: 0, consolidated: 10000000 }
        ];

        consolidatedData.forEach(row => {
            summarySheet.addRow(row);
        });

        // Format numbers as currency
        summarySheet.getColumn('preElimination').numFmt = '$#,##0';
        summarySheet.getColumn('eliminations').numFmt = '$#,##0';
        summarySheet.getColumn('consolidated').numFmt = '$#,##0';

        // Header styling
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        summarySheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Sheet 2: Entity Breakdown
        const entitySheet = workbook.addWorksheet('Entity Breakdown');
        entitySheet.columns = [
            { header: 'Entity', key: 'entity', width: 30 },
            { header: 'Currency', key: 'currency', width: 12 },
            { header: 'Original Amount', key: 'original', width: 18 },
            { header: 'FX Rate', key: 'rate', width: 12 },
            { header: 'Translated (USD)', key: 'translated', width: 18 }
        ];

        const entityData = [
            { entity: 'US Operations', currency: 'USD', original: 2000000, rate: 1.0, translated: 2000000 },
            { entity: 'UK Operations', currency: 'GBP', original: 1500000, rate: 1.27, translated: 1905000 },
            { entity: 'EU Operations', currency: 'EUR', original: 1000000, rate: 1.08, translated: 1080000 }
        ];

        entityData.forEach(row => {
            entitySheet.addRow(row);
        });

        entitySheet.getColumn('original').numFmt = '#,##0';
        entitySheet.getColumn('rate').numFmt = '0.0000';
        entitySheet.getColumn('translated').numFmt = '$#,##0';

        entitySheet.getRow(1).font = { bold: true };
        entitySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        entitySheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Sheet 3: FX Adjustments
        const fxSheet = workbook.addWorksheet('FX Adjustments');
        fxSheet.columns = [
            { header: 'Account', key: 'account', width: 40 },
            { header: 'Entity', key: 'entity', width: 30 },
            { header: 'Original Currency', key: 'currency', width: 18 },
            { header: 'FX Gain/(Loss)', key: 'fxGainLoss', width: 18 }
        ];

        const fxData = [
            { account: 'Cash', entity: 'UK Operations', currency: 'GBP', fxGainLoss: 50000 },
            { account: 'Revenue', entity: 'EU Operations', currency: 'EUR', fxGainLoss: -30000 }
        ];

        fxData.forEach(row => {
            fxSheet.addRow(row);
        });

        fxSheet.getColumn('fxGainLoss').numFmt = '$#,##0';
        fxSheet.getRow(1).font = { bold: true };
        fxSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' }
        };
        fxSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;

    }

    /**
     * Express middleware to handle export request
     */
    async handleExportRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const { runId } = req.params;

            if (!runId) {
                return res.status(400).json({ error: 'Run ID required' });
            }

            const buffer = await this.exportResultsToExcel(runId);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=consolidation-${runId}.xlsx`);
            res.send(buffer);
        } catch (error: any) {
            console.error('[EXPORT] Error:', error);
            next(error);
        }
    }
}
