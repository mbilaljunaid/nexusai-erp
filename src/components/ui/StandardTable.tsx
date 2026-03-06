
import React, { useMemo, useState } from "react";
import { i18n } from "@/lib/i18n";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import { List } from "react-window";

export interface Column<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    id?: string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    width?: string;
}

export interface StandardTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor?: (item: T) => string;

    // Pagination
    page?: number;     // Current page (1-based)
    pageSize?: number; // Items per page
    totalItems?: number;
    totalCount?: number; // Alias for totalItems
    onPageChange?: (page: number) => void;

    onRowClick?: (item: T) => void;

    className?: string;
    isLoading?: boolean;

    // Filtering
    filterColumn?: keyof T;
    filterPlaceholder?: string;

    // Virtualization
    isVirtualized?: boolean;
    height?: number;   // Height of the table container when virtualized
    itemSize?: number; // Height of each row
}

/**
 * StandardTable - Oracle Redwood / IBM Carbon inspired accessible data table.
 */
export function StandardTable<T>({
    data,
    columns,
    keyExtractor,
    page: propPage,
    pageSize = 10,
    totalItems: propTotalItems,
    totalCount: propTotalCount,
    onPageChange,
    onRowClick,
    className,
    isLoading = false,
    filterColumn,
    filterPlaceholder = "Filter...",
    isVirtualized = false,
    height = 400,
    itemSize = 52
}: StandardTableProps<T>) {
    const [localPage, setLocalPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");

    const page = propPage !== undefined ? propPage : localPage;

    const filteredData = useMemo(() => {
        if (!filterColumn || !filterValue) return data;
        return data.filter(item => {
            const val = item[filterColumn];
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(filterValue.toLowerCase());
        });
    }, [data, filterColumn, filterValue]);

    const isClientSidePagination = propTotalItems === undefined && propTotalCount === undefined;
    const totalCount = isClientSidePagination ? filteredData.length : (propTotalItems ?? propTotalCount ?? filteredData.length);
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedData = useMemo(() => {
        if (isVirtualized) return filteredData;
        if (!isClientSidePagination) return filteredData;
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize, isClientSidePagination, isVirtualized]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            if (onPageChange) {
                onPageChange(newPage);
            } else {
                setLocalPage(newPage);
            }
        }
    };

    React.useEffect(() => {
        if (isClientSidePagination && page !== 1) {
            setLocalPage(1);
            if (onPageChange) onPageChange(1);
        }
    }, [filterValue, isClientSidePagination, onPageChange, page]);

    const VirtualRow = ({ index, style, ariaAttributes }: { index: number; style: React.CSSProperties; ariaAttributes: any }) => {
        const item = paginatedData[index];
        if (!item) return null;

        return (
            <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                style={style}
                {...ariaAttributes}
                className={cn(
                    "flex border-b border-border bg-background transition-colors hover:bg-muted/30",
                    onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(item)}
            >
                {columns.map((col: Column<T>, colIdx: number) => {
                    const width = col.width || `${100 / columns.length}%`;
                    return (
                        <div
                            key={colIdx}
                            className={cn("py-3 px-4 text-sm flex items-center shrink-0 overflow-hidden", col.className)}
                            style={{ width, flexBasis: width }}
                        >
                            {(() => {
                                try {
                                    if (col.cell && typeof col.cell === "function") {
                                        return col.cell(item);
                                    }
                                    if (col.accessorKey) return (item[col.accessorKey as keyof T] as React.ReactNode);
                                    return null;
                                } catch {
                                    return <span className="text-destructive text-xs text-nowrap">Error</span>;
                                }
                            })()}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (isLoading && paginatedData.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading data...</span>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {filterColumn && (
                <div className="flex items-center">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={filterPlaceholder}
                            value={filterValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
                            className="pl-8 h-9"
                        />
                    </div>
                </div>
            )}

            <div className="rounded-md border bg-background shadow-sm overflow-hidden">
                {isVirtualized ? (
                    <div className="w-full overflow-x-auto">
                        <div
                            className="min-w-full"
                            role="grid"
                            aria-rowcount={Number(paginatedData.length)}
                        >
                            <div className="bg-muted/50 border-b border-border" role="rowgroup">
                                <div className="flex w-full" role="row">
                                    {columns.map((col, idx) => {
                                        const width = col.width || `${100 / columns.length}%`;
                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "h-10 px-4 flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0",
                                                    col.className
                                                )}
                                                style={{ width, flexBasis: width }}
                                                role="columnheader"
                                            >
                                                {col.header}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <List
                                rowComponent={VirtualRow as any}
                                rowCount={paginatedData.length}
                                rowHeight={itemSize}
                                rowProps={{} as any}
                                style={{ height }}
                                className="scrollbar-hide"
                            />
                        </div>
                    </div>
                ) : (
                    <Table aria-label={i18n.t('hr.table', 'Data Table')} role="grid">
                        <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent" role="row">
                                {columns.map((col, idx) => (
                                    <TableHead key={idx} className={cn("h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground", col.className)} role="columnheader">
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody role="rowgroup">
                            {isLoading ? (
                                <TableRow role="row">
                                    <TableCell colSpan={columns.length} className="h-24 text-center" role="gridcell">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedData.length === 0 ? (
                                <TableRow role="row">
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground" role="gridcell">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, idx) => (
                                    <TableRow
                                        key={keyExtractor ? keyExtractor(item || {} as T) : (item as any)?.id || idx}
                                        className={cn("group transition-colors hover:bg-muted/30 even:bg-muted/5", onRowClick && "cursor-pointer")}
                                        onClick={() => item && onRowClick && onRowClick(item)}
                                        role="row"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <TableCell key={colIdx} className={cn("py-3 text-sm", col.className)} role="gridcell">
                                                {(() => {
                                                    try {
                                                        if (col.cell && typeof col.cell === "function") {
                                                            return col.cell(item);
                                                        }
                                                        if (col.accessorKey) return (item[col.accessorKey] as React.ReactNode);
                                                        return null;
                                                    } catch (e) {
                                                        return <span className="text-destructive text-xs">Error</span>;
                                                    }
                                                })()}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {!isVirtualized && totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(page - 1)}
                                className={cn("cursor-pointer", page <= 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1;
                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                return (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            isActive={p === page}
                                            onClick={() => handlePageChange(p)}
                                            className="cursor-pointer"
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            }
                            if (p === page - 2 || p === page + 2) {
                                return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>;
                            }
                            return null;
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(page + 1)}
                                className={cn("cursor-pointer", page >= totalPages && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div >
    );
}
