import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StandardPage } from '@/components/layout/StandardPage';

export default function TaxReportingDashboard() {
    const [period, setPeriod] = useState("2026-02");
    const [leId, setLeId] = useState<string>();
    const scopeHeaders = buildScopeHeaders({ "legal-entity": leId });

    const { data: reporting } = useQuery<any>({
        queryKey: ["/api/tax/reporting", period, leId],
        queryFn: () => fetch(`/api/tax/reporting?period=${period}`, { headers: scopeHeaders }).then(r => r.json()),
    });

    return (
        <StandardPage
            title="Tax Reporting Dashboard"
            description="Liability reports, reconciliation, and filing prep"
            actions={
                <div className="flex gap-2 items-center">
                    <EnterpriseContextSwitcher type="legal-entity" value={leId} onChange={setLeId} className="mr-2" />
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Filing
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium">Reporting Period</label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-64">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026-01">January 2026</SelectItem>
                            <SelectItem value="2026-02">February 2026</SelectItem>
                            <SelectItem value="2026-Q1">Q1 2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Total Tax Collected</div>
                            <div className="text-3xl font-bold mt-1">${reporting?.totalCollected?.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Tax Payable</div>
                            <div className="text-3xl font-bold mt-1">${reporting?.taxPayable?.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Tax Receivable</div>
                            <div className="text-3xl font-bold mt-1">${reporting?.taxReceivable?.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Jurisdictions</div>
                            <div className="text-3xl font-bold mt-1">{reporting?.jurisdictionCount}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tax Liability by Jurisdiction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reporting?.byJurisdiction || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="jurisdiction" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="liability" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {reporting?.alerts && reporting.alerts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-orange-600">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Filing Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {reporting.alerts.map((alert: any, i: number) => (
                                <div key={i} className="border rounded-lg p-3 bg-orange-50">
                                    <div className="font-medium">{alert.title}</div>
                                    <div className="text-sm text-muted-foreground">{alert.description}</div>
                                    <Badge variant="destructive" className="mt-2">
                                        Due: {new Date(alert.dueDate).toLocaleDateString()}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
