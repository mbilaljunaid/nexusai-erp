import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Search,
    Filter
} from "lucide-react";

export interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface StandardTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onSort?: (key: string) => void;
    onFilter?: (query: string) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    isLoading?: boolean;
    searchPlaceholder?: string;
    actions?: (item: T) => React.ReactNode;
}

export function StandardTable<T extends { id: string | number }>({
    data,
    columns,
    onSort,
    onFilter,
    pagination,
    isLoading,
    searchPlaceholder = "Search...",
    actions
}: StandardTableProps<T>) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-8"
                        onChange={(e) => onFilter?.(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.accessorKey.toString()}>
                                    {col.sortable ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                                            onClick={() => onSort?.(col.accessorKey.toString())}
                                        >
                                            {col.header}
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        col.header
                                    )}
                                </TableHead>
                            ))}
                            {actions && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j}><div className="h-6 w-full bg-muted animate-pulse rounded" /></TableCell>
                                    ))}
                                    {actions && <TableCell><div className="h-6 w-full bg-muted animate-pulse rounded" /></TableCell>}
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id.toString()}>
                                    {columns.map((col) => (
                                        <TableCell key={col.accessorKey.toString()}>
                                            {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell>
                                            {actions(item)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
