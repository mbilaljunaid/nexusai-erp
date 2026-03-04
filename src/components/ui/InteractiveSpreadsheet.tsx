import React, { useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface SpreadsheetColumn<T> {
    id: string;
    header: React.ReactNode;
    width?: string;
    headerClassName?: string;
    cellClassName?: string;
    cell: (row: T, index: number, updateRow: (field: keyof T, value: any) => void) => React.ReactNode;
}

export interface InteractiveSpreadsheetProps<T> {
    data: T[];
    columns: SpreadsheetColumn<T>[];
    onChange: (newData: T[]) => void;

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
}

export function InteractiveSpreadsheet<T extends { id?: string | number, lineNumber?: number }>({
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

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10,
    });

    const handleUpdateRow = useCallback((index: number, field: keyof T, value: any) => {
        onChange(data.map((row, i) => i === index ? { ...row, [field]: value } : row));
    }, [data, onChange]);

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
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-100/50 border-b">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.id} className={`p-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap ${col.width || ''} ${col.headerClassName || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => {
                                const isSelected = activeRow !== undefined && (activeRow === row.id || activeRow === row.lineNumber);
                                return (
                                    <tr
                                        key={row.id || row.lineNumber || index}
                                        className={`border-b group transition-colors ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50/50'} ${onRowSelect ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowSelect && onRowSelect(row)}
                                    >
                                        {columns.map(col => (
                                            <td key={`${row.id || index}-${col.id}`} className={`p-2 align-top ${col.cellClassName || ''}`}>
                                                {col.cell(row, index, (field, val) => handleUpdateRow(index, field, val))}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                                        No lines available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
            <div className={`border rounded-md bg-white flex flex-col w-full is-container-${uId}`}>
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div
                    className={`grid gap-2 p-3 bg-slate-100/50 border-b font-medium text-sm text-muted-foreground is-header-${uId}`}
                >
                    {columns.map(col => (
                        <div key={col.id} className={`truncate ${col.headerClassName || ''}`}>{col.header}</div>
                    ))}
                </div>

                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div ref={parentRef} className={`flex-1 overflow-auto w-full relative is-viewport-${uId}`}>
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div className={`w-full relative is-totalsize-${uId}`}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = data[virtualRow.index];
                            const isSelected = activeRow !== undefined && (activeRow === row.id || activeRow === row.lineNumber);
                            // eslint-disable-next-line react/forbid-dom-props
                            return (
                                <div
                                    key={row.id || virtualRow.index}
                                    className={`grid gap-2 p-1 px-3 items-center border-b border-slate-50 absolute top-0 left-0 w-full ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'} ${onRowSelect ? 'cursor-pointer' : ''} is-row-${uId}-${virtualRow.index}`}
                                    onClick={() => onRowSelect && onRowSelect(row)}
                                >
                                    {columns.map(col => (
                                        <div key={`${row.id || virtualRow.index}-${col.id}`} className={`w-full ${col.cellClassName || ''}`}>
                                            {col.cell(row, virtualRow.index, (field, val) => handleUpdateRow(virtualRow.index, field, val))}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
                Showing {data.length} lines. Optimized for high-volume data entry.
            </p>
            {footer && <div className="mt-4">{footer}</div>}
        </div >
    );
}
