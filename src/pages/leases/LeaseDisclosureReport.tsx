
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPage } from '@/components/layout/StandardPage';

export default function LeaseDisclosureReport() {
    // In a real app, this would be a dedicated aggregated endpoint.
    // Simulating aggregation from the list endpoint for now.
    const { data: leases, isLoading } = useQuery<any>({
        queryKey: ["leases", "all"],
        queryFn: async () => {
            const res = await fetch(`/api/lease/leases`); // Assuming list endpoint returns all
            if (!res.ok) return []; // Fallback for demo if list not fully implemented
            return res.json();
        }
    });

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    // Mock calculations if API doesn't return aggregated stats
    const totalLiability = 2450000;
    const weightedAvgRate = 4.25;
    const weightedAvgTerm = 48; // months

    const maturityAnalysis = [
        { year: "Year 1", amount: 600000 },
        { year: "Year 2", amount: 580000 },
        { year: "Year 3", amount: 550000 },
        { year: "Year 4", amount: 400000 },
        { year: "Year 5", amount: 200000 },
        { year: "Thereafter", amount: 120000 },
    ];

    return (
        <StandardPage
            title="Lease Disclosure Report"
            description="IFRS 16 / ASC 842 Note Disclosure Generator"
            actions={
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Print PDF
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Weighted Avg. Discount Rate</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-indigo-600">{weightedAvgRate}%</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Weighted Avg. Remaining Term</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-blue-600">{weightedAvgTerm} Months</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Lease Liability</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-700">${totalLiability.toLocaleString()}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Maturity Analysis of Lease Liabilities</CardTitle>
                    <CardDescription>Undiscounted cash flows due per year (Note 16.b)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">Undiscounted Payment Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {maturityAnalysis.map((row) => (
                                <TableRow key={row.year}>
                                    <TableCell className="font-medium">{row.year}</TableCell>
                                    <TableCell className="text-right">${row.amount.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-slate-50 font-bold">
                                <TableCell>Total Undiscounted Liabilities</TableCell>
                                <TableCell className="text-right">${(2450000).toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ROU Assets by Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Real Estate</TableCell>
                                    <TableCell className="text-right">$1,800,000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Equipment</TableCell>
                                    <TableCell className="text-right">$450,000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Vehicles</TableCell>
                                    <TableCell className="text-right">$200,000</TableCell>
                                </TableRow>
                                <TableRow className="font-bold border-t-2">
                                    <TableCell>Total ROU Assets</TableCell>
                                    <TableCell className="text-right">$2,450,000</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lease Expense Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Amortization of ROU Assets</TableCell>
                                    <TableCell className="text-right">$120,000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Interest on Lease Liabilities</TableCell>
                                    <TableCell className="text-right">$45,000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Short-term Lease Expense</TableCell>
                                    <TableCell className="text-right">$12,000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Low-value Lease Expense</TableCell>
                                    <TableCell className="text-right">$5,000</TableCell>
                                </TableRow>
                                <TableRow className="font-bold border-t-2">
                                    <TableCell>Total Lease Cost</TableCell>
                                    <TableCell className="text-right">$182,000</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
