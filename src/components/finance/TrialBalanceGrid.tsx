import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function TrialBalanceGrid() {
    const { data: report = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/trial-balance"],
        queryFn: () => fetch("/api/gl/trial-balance").then(res => res.json())
    });

    const totalDebits = report.reduce((sum, r) => sum + r.totalDebit, 0);
    const totalCredits = report.reduce((sum, r) => sum + r.totalCredit, 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return (
        <Card className="h-full border-t-4 border-t-primary">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Trial Balance</CardTitle>
                    <Badge variant={isBalanced ? "default" : "destructive"} className="text-base px-4 py-1">
                        {isBalanced ? "Balanced" : "Unbalanced"}
                    </Badge>
                </div>
                <div className="flex gap-8 text-sm text-muted-foreground mt-2">
                    <div>Total Debits: <span className="text-foreground font-bold font-mono">${totalDebits.toLocaleString()}</span></div>
                    <div>Total Credits: <span className="text-foreground font-bold font-mono">${totalCredits.toLocaleString()}</span></div>
                    <div>Difference: <span className={`font-bold font-mono ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>${Math.abs(totalDebits - totalCredits).toLocaleString()}</span></div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Account Code</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                                <TableHead className="text-right font-bold">Net Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : report.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No data available</TableCell></TableRow>
                            ) : (
                                report.map((row) => (
                                    <TableRow key={row.accountId} className="hover:bg-muted/5">
                                        <TableCell className="font-mono">{row.accountCode}</TableCell>
                                        <TableCell className="font-medium">{row.accountName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">{row.accountType}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {row.totalDebit > 0 ? `$${row.totalDebit.toLocaleString()}` : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {row.totalCredit > 0 ? `$${row.totalCredit.toLocaleString()}` : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold">
                                            <span className={row.displayBalance >= 0 ? "text-foreground" : "text-red-600"}>
                                                {row.displayBalance >= 0 ? `$${row.displayBalance.toLocaleString()}` : `($${Math.abs(row.displayBalance).toLocaleString()})`}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
