
import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, FileBarChart } from "lucide-react";

interface RollForwardRow {
    major_category: string;
    minor_category: string;
    additions: string | number;
    retirements: string | number;
    depr_expense: string | number;
    net_movement: string | number;
}

export function AssetRollForwardReport() {
    const [bookId, setBookId] = useState("CORP-BOOK-1");
    const [period, setPeriod] = useState("JAN-2026");

    const { data: rows, isLoading } = useQuery<RollForwardRow[]>({
        queryKey: ["/api/fa/reports/roll-forward", { bookId, periodName: period }],
        enabled: !!bookId && !!period,
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-end bg-muted/30 p-4 rounded-lg">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Asset Book</label>
                    <Select value={bookId} onValueChange={setBookId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Book" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CORP-BOOK-1">Corporate Book</SelectItem>
                            <SelectItem value="TAX-BOOK-1">Tax Book</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Period</label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="JAN-2026">Jan-2026</SelectItem>
                            <SelectItem value="FEB-2026">Feb-2026</SelectItem>
                            <SelectItem value="MAR-2026">Mar-2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Asset Roll Forward</CardTitle>
                        <CardDescription>Movement summary for {period}</CardDescription>
                    </div>
                    <FileBarChart className="h-8 w-8 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Additions</TableHead>
                                    <TableHead className="text-right">Retirements</TableHead>
                                    <TableHead className="text-right">Depreciation</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Net Movement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows?.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">
                                            {row.major_category} {row.minor_category ? `/ ${row.minor_category}` : ''}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">
                                            +${Number(row.additions).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            -${Math.abs(Number(row.retirements)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right text-orange-600">
                                            -${Math.abs(Number(row.depr_expense)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-600">
                                            ${Number(row.net_movement).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!rows || rows.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No movements found for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground italic">
                * Net Movement includes Cost Additions, Net Book Value Retirements, and Periodic Depreciation.
            </div>
        </div>
    );
}
