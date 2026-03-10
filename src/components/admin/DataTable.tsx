import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export interface DataTableColumn<T> {
    id: string;
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    sortConfig?: { key: string; direction: 'asc' | 'desc' };
    onSort?: (key: string) => void;
    selectedIds?: Set<string>;
    onSelectAll?: (checked: boolean) => void;
    onSelectRow?: (id: string) => void;
    getRowId: (item: T) => string;
}

export function DataTable<T>({
    data,
    columns,
    sortConfig,
    onSort,
    selectedIds,
    onSelectAll,
    onSelectRow,
    getRowId,
}: DataTableProps<T>) {
    const hasSelection = selectedIds !== undefined && onSelectAll !== undefined && onSelectRow !== undefined;
    const allSelected = hasSelection && data.length > 0 && data.every(item => selectedIds.has(getRowId(item)));
    const someSelected = hasSelection && data.some(item => selectedIds.has(getRowId(item))) && !allSelected;

    const getSortIcon = (columnId: string) => {
        if (!sortConfig || sortConfig.key !== columnId) {
            return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3 ml-1" />
            : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {hasSelection && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                                    aria-label="Select all"
                                    className={someSelected ? 'opacity-50' : ''}
                                />
                            </TableHead>
                        )}
                        {columns.map((column) => (
                            <TableHead key={column.id}>
                                {column.sortable && onSort ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8"
                                        onClick={() => onSort(column.id)}
                                    >
                                        {column.header}
                                        {getSortIcon(column.id)}
                                    </Button>
                                ) : (
                                    column.header
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (hasSelection ? 1 : 0)}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No results found
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => {
                            const rowId = getRowId(item);
                            const isSelected = hasSelection && selectedIds.has(rowId);

                            return (
                                <TableRow
                                    key={rowId}
                                    className={isSelected ? 'bg-muted/50' : ''}
                                >
                                    {hasSelection && (
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onSelectRow(rowId)}
                                                aria-label={`Select row ${rowId}`}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            {column.cell
                                                ? column.cell(item)
                                                : column.accessorKey
                                                    ? String(item[column.accessorKey] ?? '')
                                                    : ''}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
