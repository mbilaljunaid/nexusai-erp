import React, { useMemo, useState } from "react";
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
// @ts-ignore
import { FixedSizeList as List } from "react-window";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
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
 * StandardTable
 * Implements IBM Carbon DataTable behavior with Oracle Redwood styling (spacing, fonts).
 * Features:
 * - Sortable columns (skeleton for now)
 * - Pagination integration
 * - Loading state
 * - Empty state
 * - Client-side Filtering (Simple)
 * - Virtualization support for large datasets
 */
export function StandardTable<T>({
    data,
    columns,
    keyExtractor,
    page: propPage,
    pageSize = 10,
    totalItems: propTotalItems,
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

    // Determine effective page
    const page = propPage !== undefined ? propPage : localPage;

    // Filtering Logic
    const filteredData = useMemo(() => {
        if (!filterColumn || !filterValue) return data;
        return data.filter(item => {
            const val = item[filterColumn];
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(filterValue.toLowerCase());
        });
    }, [data, filterColumn, filterValue]);

    // Pagination Logic
    const isClientSidePagination = propTotalItems === undefined;
    const totalCount = isClientSidePagination ? filteredData.length : (propTotalItems ?? filteredData.length);
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedData = useMemo(() => {
        if (isVirtualized) return filteredData; // Virtualization handles its own windowing
        if (!isClientSidePagination) return filteredData;
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize, isClientSidePagination, isVirtualized]);

    // Handle Page Change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            if (onPageChange) {
                onPageChange(newPage);
            } else {
                setLocalPage(newPage);
            }
        }
    };

    // Reset page on filter change
    React.useEffect(() => {
        if (isClientSidePagination && page !== 1) {
            setLocalPage(1);
            if (onPageChange) onPageChange(1);
        }
    }, [filterValue, isClientSidePagination, onPageChange, page]);

    // Virtualized Row Renderer
    const Row = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
        const item = paginatedData[index];
        if (!item) return null;

        return (
            <div
                style={style}
                className={cn(
                    "flex border-b border-border bg-white transition-colors hover:bg-muted/30",
                    onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(item)}
                role="row"
            >
                {columns.map((col: any, colIdx) => (
                    <div
                        key={colIdx}
                        className={cn("py-3 px-4 text-sm flex items-center shrink-0 overflow-hidden", col.className)}
                        style={{
                            width: col.width || `${100 / columns.length}%`,
                            "--col-width": col.width || `${100 / columns.length}%`
                        } as any}
                        role="gridcell"
                    >
                        {col.cell
                            ? (typeof col.cell === "function"
                                ? col.cell(item)
                                : col.cell)
                            : col.accessorKey
                                ? (item[col.accessorKey as keyof T] as React.ReactNode)
                                : null}
                    </div>
                ))}
            </div>
        );
    }, [paginatedData, onRowClick, columns]);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Toolbar / Filter */}
            {filterColumn && (
                <div className="flex items-center">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={filterPlaceholder}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="pl-8 h-9"
                        />
                    </div>
                </div>
            )}

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                {isVirtualized ? (
                    <>
                        {isLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground" role="status">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-sm font-medium">Loading data...</span>
                            </div>
                        ) : paginatedData.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground" role="status">
                                <Search className="h-6 w-6 opacity-20" />
                                <span className="text-sm">No results found.</span>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <div
                                    className="min-w-full"
                                    role="grid"
                                    aria-colcount={columns.length}
                                    aria-rowcount={paginatedData.length}
                                >
                                    {/* Header */}
                                    <div className="bg-muted/50 border-b border-border" role="rowgroup">
                                        <div className="flex w-full" role="row">
                                            {columns.map((col, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "h-10 px-4 flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0",
                                                        col.className
                                                    )}
                                                    style={{
                                                        width: col.width || `${100 / columns.length}%`,
                                                        flexBasis: col.width || `${100 / columns.length}%`
                                                    } as React.CSSProperties}
                                                    role="columnheader"
                                                >
                                                    {col.header}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Virtualized List */}
                                    <List
                                        height={height}
                                        itemCount={paginatedData.length}
                                        itemSize={itemSize}
                                        width="100%"
                                        className="scrollbar-hide"
                                        innerElementType={React.forwardRef(({ children, ...props }: any, ref) => (
                                            <div ref={ref} {...props} role="rowgroup">
                                                {children}
                                            </div>
                                        ))}
                                    >
                                        {Row}
                                    </List>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                {columns.map((col, idx) => (
                                    <TableHead key={idx} className={cn("h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground", col.className)}>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, idx) => (
                                    <TableRow
                                        key={keyExtractor ? keyExtractor(item || {} as T) : (item as any)?.id || idx}
                                        className={cn("group transition-colors hover:bg-muted/30", onRowClick && "cursor-pointer")}
                                        onClick={() => item && onRowClick && onRowClick(item)}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <TableCell key={colIdx} className={cn("py-3 text-sm", col.className)}>
                                                {col.cell
                                                    ? col.cell(item)
                                                    : col.accessorKey
                                                        ? (item[col.accessorKey] as React.ReactNode)
                                                        : null}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Pagination Controls - Only show if not virtualized OR specifically requested */}
            {
                !isVirtualized && totalPages > 1 && (
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
                )
            }
        </div >
    );
}
