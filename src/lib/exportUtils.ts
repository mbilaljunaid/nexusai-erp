import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export data to Excel format
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export HTML element to PNG using html2canvas
 */
export async function exportElementToPNG(elementId: string, filename: string) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return;
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Generate PDF from data table
 */
export function exportToPDF(data: any[], columns: string[], filename: string, title?: string) {
    const doc = new jsPDF();

    // Add title if provided
    if (title) {
        doc.setFontSize(16);
        doc.text(title, 14, 15);
    }

    // Prepare table data
    const headers = columns;
    const rows = data.map(item => columns.map(col => String(item[col] || '')));

    // Add table
    doc.setFontSize(10);
    let yPos = title ? 25 : 15;

    // Header row
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
        doc.text(header, 14 + (i * 40), yPos);
    });

    // Data rows
    doc.setFont('helvetica', 'normal');
    rows.forEach((row, rowIndex) => {
        yPos += 7;
        if (yPos > 280) {
            doc.addPage();
            yPos = 15;
        }
        row.forEach((cell, i) => {
            doc.text(String(cell).substring(0, 30), 14 + (i * 40), yPos);
        });
    });

    doc.save(`${filename}.pdf`);
}

/**
 * Export chart/canvas element to image
 */
export async function exportChartToPNG(canvasId: string, filename: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
        console.error(`Canvas with id "${canvasId}" not found`);
        return;
    }

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
