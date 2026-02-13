// Export utility functions for admin pages

/**
 * Converts array of objects to CSV format
 */
export function convertToCSV(data: any[], headers?: string[]): string {
    if (data.length === 0) return '';

    // Use provided headers or extract from first object
    const csvHeaders = headers || Object.keys(data[0]);

    // Create header row
    const headerRow = csvHeaders.join(',');

    // Create data rows
    const dataRows = data.map(row => {
        return csvHeaders.map(header => {
            const value = row[header];

            // Handle null/undefined
            if (value == null) return '';

            // Handle strings with commas or quotes - escape them
            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }

            // Handle dates
            if (value instanceof Date) {
                return value.toISOString();
            }

            // Handle objects/arrays - stringify
            if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }

            return String(value);
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

/**
 * Triggers browser download of a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generates export filename with current date
 */
export function getExportFilename(baseName: string, extension: string = 'csv'): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${baseName}_export_${dateStr}.${extension}`;
}

/**
 * Export data to CSV and download
 */
export function exportToCSV(data: any[], baseName: string, headers?: string[]): void {
    const csv = convertToCSV(data, headers);
    const filename = getExportFilename(baseName);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}
