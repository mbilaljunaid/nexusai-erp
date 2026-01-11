
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ArReports() {
    const { data: aging, refetch: refetchAging } = useQuery({
        queryKey: ["/api/ar/reports/aging"],
        queryFn: async () => (await apiRequest("GET", "/api/ar/reports/aging")).json()
    });

    const { data: recon, refetch: refetchRecon } = useQuery({
        queryKey: ["/api/ar/reports/reconciliation"],
        queryFn: async () => (await apiRequest("GET", "/api/ar/reports/reconciliation")).json()
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AR Reporting & Analytics</h1>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export All
                </Button>
            </div>

            <Tabs defaultValue="aging">
                <TabsList>
                    <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
                    <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                    <TabsTrigger value="statements">Customer Statements</TabsTrigger>
                </TabsList>

                <TabsContent value="aging" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>7-Bucket Aging Report</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchAging()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Current</TableHead>
                                        <TableHead>1-30 Days</TableHead>
                                        <TableHead>31-60 Days</TableHead>
                                        <TableHead>61-90 Days</TableHead>
                                        <TableHead>91-180 Days</TableHead>
                                        <TableHead>180-360 Days</TableHead>
                                        <TableHead>&gt; 360 Days</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>${aging?.current?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days1_30?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days31_60?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days61_90?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days91_180?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days180_360?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.over360?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell className="text-right font-bold">${aging?.total?.toLocaleString() ?? 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reconciliation">
                    <Card>
                        <CardHeader>
                            <CardTitle>AR to GL Reconciliation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 border rounded bg-slate-50">
                                    <div className="text-sm text-muted-foreground">Subledger Balance</div>
                                    <div className="text-2xl font-bold">${recon?.subledgerBalance?.toLocaleString()}</div>
                                </div>
                                <div className="p-4 border rounded bg-slate-50">
                                    <div className="text-sm text-muted-foreground">GL Control Account</div>
                                    <div className="text-2xl font-bold">${recon?.glBalance?.toLocaleString()}</div>
                                </div>
                                <div className={`p-4 border rounded ${recon?.difference === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="text-sm text-muted-foreground">Difference</div>
                                    <div className={`text-2xl font-bold ${recon?.difference === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                        ${recon?.difference?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Statements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Select a customer to generate statement (Coming Soon)
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
