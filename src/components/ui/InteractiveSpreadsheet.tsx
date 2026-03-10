import React, { useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface SpreadsheetColumn<T = any> {
    id?: string;
    header?: React.ReactNode;
    label?: React.ReactNode;
    width?: string | number;
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    cell?: (row: T, index: number, updateRow: (field: keyof T, value: any) => void) => React.ReactNode;
    [key: string]: any; // Allow legacy properties
}

export interface InteractiveSpreadsheetProps<T = any> {
    data: T[];
    columns: SpreadsheetColumn<T>[];
    onChange?: (newData: T[]) => void;

    // Virtualization features
    virtualized?: boolean;
    rowHeight?: number;
    containerHeight?: string;

    // Footer aggregations
    footer?: React.ReactNode;

    // Paste
    onPasteFromClipboard?: () => void;

    // Selection Features
    activeRow?: string | number | null;
    onRowSelect?: (row: T) => void;

    // Added optional legacy unused props for compatibility
    isLoading?: boolean;
    isSaving?: boolean;
    onSave?: (data: T[]) => void;
    rowKey?: string;
    onRowClick?: (item: T) => void;
    actions?: (row: T) => React.ReactNode;
    filterPlaceholder?: string;
}

export function InteractiveSpreadsheet<T = any>({
    data,
    columns,
    onChange,
    virtualized = false,
    rowHeight = 45,
    containerHeight = "500px",
    footer,
    onPasteFromClipboard,
    activeRow,
    onRowSelect
}: InteractiveSpreadsheetProps<T>) {

    const safeData = Array.isArray(data) ? data : [];
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: safeData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10,
    });

    const handleUpdateRow = useCallback((index: number, field: keyof T, value: any) => {
        onChange?.(safeData.map((row, i) => i === index ? { ...row, [field]: value } : row));
    }, [safeData, onChange]);

    // Render traditional table
    if (!virtualized) {
        return (
            <div className="flex flex-col w-full">
                {onPasteFromClipboard && (
                    <div className="flex justify-end mb-2">
                        <Button variant="outline" size="sm" onClick={onPasteFromClipboard}>
                            <Copy className="w-4 h-4 mr-2" /> Paste Excel / TSV
                        </Button>
                    </div>
                )}
                <div className="overflow-x-auto w-full">
                    <Table >
                        <TableHeader className="bg-muted/50 border-b">
                            <TableRow>
                                {columns.map((col, i) => (
                                    <TableHead key={col.id || `col-${i}`} className={`p-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap ${col.width || ''} ${col.headerClassName || ''}`}>
                                        {col.header || col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {safeData.map((row, index) => {
                                const rowAny = row as any;
                                const isSelected = activeRow !== undefined && (activeRow === rowAny.id || activeRow === rowAny.lineNumber);
                                return (
                                    <TableRow
                                        key={rowAny.id || rowAny.lineNumber || index}
                                        className={`border-b group transition-colors ${isSelected ? 'bg-muted' : 'hover:bg-muted/50/50'} ${onRowSelect ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowSelect && onRowSelect(row)}
                                    >
                                        {columns.map((col, cIdx) => (
                                            <TableCell key={`${(row as any).id || index}-${col.id || cIdx}`} className={`p-2 align-top ${col.cellClassName || ''}`}>
                                                {col.cell ? col.cell(row, index, (field, val) => handleUpdateRow(index, field, val)) : (col.id ? String((row as any)[col.id] ?? '') : '')}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                            {safeData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                                        No lines available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {footer && <div className="mt-4">{footer}</div>}
            </div>
        );
    }

    // Render virtualized grid (assumes columns pass fixed grid classes via style or width)
    const gridTemplateColumns = columns.map(c => c.width || "1fr").join(" ");
    const uId = React.useId().replace(/:/g, '');

    const dynamicStyles = `
        .is-container-${uId} { min-height: ${containerHeight}; }
        .is-header-${uId} { grid-template-columns: ${gridTemplateColumns}; }
        .is-viewport-${uId} { height: ${containerHeight}; }
        .is-totalsize-${uId} { height: ${rowVirtualizer.getTotalSize()}px; }
        ${rowVirtualizer.getVirtualItems().map((virtualRow) => `
            .is-row-${uId}-${virtualRow.index} { height: ${virtualRow.size}px; transform: translateY(${virtualRow.start}px); grid-template-columns: ${gridTemplateColumns}; }
        `).join('')}
    `;

    return (
        <div className="flex flex-col w-full h-full">
            <style>{dynamicStyles}</style>
            {onPasteFromClipboard && (
                <div className="flex justify-end mb-2">
                    <Button variant="outline" size="sm" onClick={onPasteFromClipboard}>
                        <Copy className="w-4 h-4 mr-2" /> Paste Excel / TSV
                    </Button>
                </div>
            )}

            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div className={`border rounded-md bg-card flex flex-col w-full is-container-${uId}`}>
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div
                    className={`grid gap-2 p-3 bg-muted/50 border-b font-medium text-sm text-muted-foreground is-header-${uId}`}
                >
                    {columns.map((col, i) => (
                        <div key={col.id || `col-${i}`} className={`truncate ${col.headerClassName || ''}`}>{col.header || col.label}</div>
                    ))}
                </div>

                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div ref={parentRef} className={`flex-1 overflow-auto w-full relative is-viewport-${uId}`}>
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div className={`w-full relative is-totalsize-${uId}`}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = safeData[virtualRow.index];
                            const rowAny = row as any;
                            const isSelected = activeRow !== undefined && (activeRow === rowAny.id || activeRow === rowAny.lineNumber);
                            // eslint-disable-next-line react/forbid-dom-props
                            return (
                                <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => onRowSelect && onRowSelect(row)}>
                                    <div
                                        key={rowAny.id || virtualRow.index}
                                        className={`grid gap-2 p-1 px-3 items-center border-b border-slate-50 absolute top-0 left-0 w-full ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'} ${onRowSelect ? 'cursor-pointer' : ''} is-row-${uId}-${virtualRow.index}`}
                                    >
                                        {columns.map((col, cIdx) => (
                                            <div key={`${(row as any).id || virtualRow.index}-${col.id || cIdx}`} className={`w-full ${col.cellClassName || ''}`}>
                                                {col.cell ? col.cell(row, virtualRow.index, (field, val) => handleUpdateRow(virtualRow.index, field, val)) : (col.id ? String((row as any)[col.id] ?? '') : '')}
                                            </div>
                                        ))}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
                Showing {safeData.length} lines. Optimized for high-volume data entry.
            </p>
            {footer && <div className="mt-4">{footer}</div>}
        </div >
    );
}
