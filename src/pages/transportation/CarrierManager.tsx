import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Star, Globe, Phone, Mail, Award, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";


export default function CarrierManager() {
    const { data: carriers, isLoading } = useQuery({
        queryKey: ["/api/transportation/carriers"],
        queryFn: () => fetch("/api/transportation/carriers").then(res => res.json())
    });

    const columns = [
        { id: "scacCode", header: "SCAC", width: "120px", cell: (row: any) => <div className="px-2 h-full flex items-center">{row.scacCode}</div> },
        { id: "name", header: "Carrier Name", width: "300px", cell: (row: any) => <div className="px-2 h-full flex items-center font-semibold">{row.name}</div> },
        { id: "mode", header: "Mode", width: "150px", cell: (row: any) => <div className="px-2 h-full flex items-center"><Badge variant="outline">{row.mode}</Badge></div> },
        {
            id: "serviceLevel",
            header: "Service Level",
            width: "200px",
            cell: (row: any) => (
                <div className="px-2 h-full flex items-center span className=text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {row.serviceLevel || "Standard"}
                </div>
            )
        },
        {
            id: "rating",
            header: "Rating",
            width: "150px",
            cell: (row: any) => (
                <div className="flex items-center text-amber-500 px-2 h-full">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span className="font-bold">{row.rating}</span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "150px",
            cell: () => (
                <div className="px-2 h-full flex items-center">
                    <Button size="xs" variant="outline">Details</Button>
                </div>
            )
        }
    ];
    return (
        <StandardPage title="Carrier & Rate Management">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground">Manage transportation providers, service levels, and performance ratings.</p>
                </div>
                <Button variant="premium">
                    <Award className="mr-2 h-4 w-4" /> Strategic Sourcing
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-blue-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Total Carriers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{carriers?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-green-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">Avg. Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">4.82</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-purple-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-900">Active Agreements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-900">24</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900">Renewal Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">3</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex-1 max-w-sm">
                    <ContextualSearch
                        placeholder="Search carriers by SCAC or Name..."
                        fields={[{ key: "query", label: "Search", type: "text" }]}
                        onSearch={() => { }}
                    />
                </div>
                <Button variant="outline" size="sm">
                    <Globe className="mr-2 h-4 w-4" /> All Lanes
                </Button>
            </div>

            <Card className="border-none shadow-premium overflow-hidden">
                <CardContent className="p-0 h-[400px]">
                    <InteractiveSpreadsheet
                        data={carriers || []}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="400px"
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                            <Shield className="h-5 w-5 text-indigo-600" />
                            Compliance Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "Global Logistics", metric: "Insurance Active", status: "Valid" },
                            { name: "FastWay Freight", metric: "Safety Rating", status: "Satisfactory" },
                            { name: "Oceanic Blue", metric: "Hazardous Materials Cert", status: "Expiring Soon" }
                        ].map((c, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.metric}</p>
                                </div>
                                <Badge variant={c.status === "Valid" ? "success" : c.status === "Satisfactory" ? "default" : "warning"}>
                                    {c.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Rate Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-l">
                            {[45, 60, 55, 75, 80, 70, 90].map((h, i) => (
                                <div key={i} className="w-8 bg-emerald-500/20 hover:bg-emerald-500 transition-all rounded-t-sm cursor-help" style={{ height: `${h}%` }} title={`Month ${i + 1}: $${h * 10}`}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase tracking-widest px-2">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                            <span>Jul</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
