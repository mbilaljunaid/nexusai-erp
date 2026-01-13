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

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
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
    filterPlaceholder = "Filter..."
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
    // If external pagination is used (totalItems provided), we rely on props.
    // Otherwise we assume client-side pagination on filteredData.
    const isClientSidePagination = propTotalItems === undefined;
    const totalCount = isClientSidePagination ? filteredData.length : (propTotalItems ?? filteredData.length);
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedData = useMemo(() => {
        if (!isClientSidePagination) return filteredData; // Server handles pagination, filteredData is just the current chunk (assumed) OR ignored if server filtering
        // Actually for mixed mode: if totalItems is passed, we assume 'data' is ALREADY the current page.
        // So we just return data.
        // If totalItems is NOT passed, we paginate 'filteredData'.
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize, isClientSidePagination]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterValue]);


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
                                    key={keyExtractor ? keyExtractor(item) : (item as any).id || idx}
                                    className={cn("group transition-colors hover:bg-muted/30", onRowClick && "cursor-pointer")}
                                    onClick={() => onRowClick && onRowClick(item)}
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(page - 1)}
                                className={cn("cursor-pointer", page <= 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>

                        {/* Simplified Pagination Logic */}
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1;
                            // Show first, last, current, and neighbors
                            if (
                                p === 1 ||
                                p === totalPages ||
                                (p >= page - 1 && p <= page + 1)
                            ) {
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
                            // Ellipsis Logic
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
        </div>
    );
}
