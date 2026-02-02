import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { DollarSign, FileText, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";

// Mock data for initial UI build
const mockMetrics = [
    {
        title: "Total Tax Collected",
        value: "$1,245,678",
        change: 12.5,
        icon: DollarSign,
        iconColor: "text-green-600",
    },
    {
        title: "Tax Payable",
        value: "$45,230",
        change: -2.3,
        icon: FileText,
        iconColor: "text-blue-600",
    },
    {
        title: "Pending Filings",
        value: "3",
        change: 0,
        icon: AlertCircle,
        iconColor: "text-orange-600",
    },
    {
        title: "Audit Risks",
        value: "0",
        change: 0,
        icon: RefreshCw,
        iconColor: "text-purple-600",
    },
];

const mockTransactions = [
    { id: "TX-001", date: "2024-03-15", customer: "Acme Corp", amount: "$15,000.00", tax: "$1,200.00", jurisdiction: "US Federal", status: "Posted" },
    { id: "TX-002", date: "2024-03-16", customer: "Globex Inc", amount: "$8,500.00", tax: "$680.00", jurisdiction: "NY State", status: "Posted" },
    { id: "TX-003", date: "2024-03-16", customer: "Soylent Corp", amount: "$22,100.00", tax: "$1,768.00", jurisdiction: "CA State", status: "Review" },
];

export function TaxDashboardTab() {
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    return (
        <div className="space-y-6">
            <div className="flex gap-2 justify-end mb-4">
                <Button variant="outline">Download Report</Button>
                <Button>Run Period Close</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mockMetrics.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Tax Calculations</CardTitle>
                        <CardDescription>
                            Latest transactions processed by the tax engine.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Jurisdiction</TableHead>
                                    <TableHead className="text-right">Tax Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTransactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">{tx.id}</TableCell>
                                        <TableCell>{tx.date}</TableCell>
                                        <TableCell>{tx.jurisdiction}</TableCell>
                                        <TableCell className="text-right">{tx.tax}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tx.status === 'Posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {tx.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(tx)}>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent className="w-[400px] sm:w-[540px]">
                                                    <SheetHeader>
                                                        <SheetTitle>Transaction Details</SheetTitle>
                                                        <SheetDescription>
                                                            Detailed tax breakdown for {tx.id}
                                                        </SheetDescription>
                                                    </SheetHeader>
                                                    <div className="py-4 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                                                <p className="text-sm">{tx.customer}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                                                <p className="text-sm">{tx.date}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Jurisdiction</p>
                                                                <p className="text-sm">{tx.jurisdiction}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                                                <p className="text-sm">{tx.status}</p>
                                                            </div>
                                                        </div>

                                                        <div className="bg-muted p-4 rounded-md space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm">Taxable Amount</span>
                                                                <span className="text-sm font-medium">{tx.amount}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm">Tax Rate</span>
                                                                <span className="text-sm font-medium">8.0%</span>
                                                            </div>
                                                            <div className="flex justify-between border-t pt-2 mt-2">
                                                                <span className="font-semibold">Tax Amount</span>
                                                                <span className="font-semibold">{tx.tax}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-semibold">Rule Trace</h4>
                                                            <div className="text-xs bg-slate-950 text-slate-50 p-3 rounded font-mono">
                                                                {`> Place of Supply: ${tx.jurisdiction}\n> Nexus: ESTABLISHED\n> Taxability: TAXABLE\n> Exemption: NONE\n> Rate: STANDARD`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Tax Calendar</CardTitle>
                        <CardDescription>Upcoming filing deadlines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center p-3 border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <span className="font-bold text-blue-600">15</span>
                                </div>
                                <div>
                                    <p className="font-medium">US Federal Quarterly</p>
                                    <p className="text-sm text-muted-foreground">Due in 3 days</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                    <span className="font-bold text-green-600">20</span>
                                </div>
                                <div>
                                    <p className="font-medium">NY Sales Tax</p>
                                    <p className="text-sm text-muted-foreground">Due in 8 days</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
