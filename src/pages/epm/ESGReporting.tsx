import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Leaf, FileText, Download, Calculator, TrendingDown,
    Activity, Globe2, AlertCircle, Search, RefreshCw, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const EMISSIONS_DATA = [
    { source: "Facility Electricity (Scope 2)", consumption: "145,000 kWh", factor: "0.453 kg CO2e/kWh", total: "65.68", unit: "tCO2e" },
    { source: "Company Fleet (Scope 1)", consumption: "12,400 Gallons", factor: "8.89 kg CO2e/Gal", total: "110.23", unit: "tCO2e" },
    { source: "Business Travel (Scope 3)", consumption: "250,000 Miles", factor: "0.14 kg CO2e/Mile", total: "35.00", unit: "tCO2e" },
    { source: "Data Center Cooling (Scope 1)", consumption: "4,500 Therms", factor: "5.3 kg CO2e/Therm", total: "23.85", unit: "tCO2e" },
];

const DISCLOSURES = [
    { name: "GRI Content Index 2026", standard: "GRI", status: "ready", date: "Oct 24, 2026" },
    { name: "SASB Technology & Comm.", standard: "SASB", status: "draft", date: "Oct 20, 2026" },
    { name: "TCFD Climate Risk Report", standard: "TCFD", status: "review", date: "Oct 15, 2026" }
];

export default function ESGReporting() {
    const [activeTab, setActiveTab] = useState("emissions");
    const [selectedFramework, setSelectedFramework] = useState("gri");

    return (
        <StandardPage
            title="ESG & Sustainability"
            description="Track carbon footprints, manage conversion factors, and generate compliance disclosures."
            className="flex flex-col h-[calc(100vh-80px)]"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Sync IoT Data</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"><Download className="h-4 w-4 mr-2" /> Export ESG Data</Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">

                {/* Metrics */}
                <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl bg-card">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Emissions</p>
                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-3xl font-black tracking-tighter text-foreground">234.7</span>
                            <span className="text-sm font-bold text-muted-foreground pb-1">tCO2e</span>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-md border border-emerald-100">
                            <TrendingDown className="h-3.5 w-3.5" /> 12.4% vs Last Year
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl bg-card">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Renewable Energy</p>
                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-3xl font-black tracking-tighter text-foreground">42.8</span>
                            <span className="text-sm font-bold text-muted-foreground pb-1">%</span>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 w-max px-2 py-1 rounded-md border border-blue-100">
                            Target: 60% by 2028
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 border-none shadow-sm ring-1 ring-emerald-200 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Disclosure Readiness</p>
                            <h3 className="text-2xl font-black mt-1">GRI & CSRD Compliant</h3>
                            <p className="text-sm text-emerald-50 mt-2 max-w-xs font-medium">All material topics and scope 1, 2, 3 emissions mapped to reporting frameworks.</p>
                        </div>
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="emissions" className="mt-6 flex-1 flex flex-col min-h-0" onValueChange={setActiveTab}>
                <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 p-0 space-x-6">
                    <TabsTrigger value="emissions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 font-bold uppercase tracking-tight">Scope 1-3 tracking</TabsTrigger>
                    <TabsTrigger value="disclosures" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 font-bold uppercase tracking-tight">Reporting & Disclosures</TabsTrigger>
                    <TabsTrigger value="factors" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 font-bold uppercase tracking-tight">Conversion Factors</TabsTrigger>
                </TabsList>

                <TabsContent value="emissions" className="flex-1 mt-6">
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden bg-card">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-500" /> Emissions Data Ledger</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6 h-12">Emission Source</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest h-12">Raw Consumption</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest h-12">Conversion Factor</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest h-12 text-right px-6">Total Emissions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {EMISSIONS_DATA.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="px-6 font-semibold">{row.source}</TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{row.consumption}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono text-xs font-semibold">{row.factor}</Badge>
                                            </TableCell>
                                            <TableCell className="px-6 text-right">
                                                <span className="font-black text-lg">{row.total}</span>
                                                <span className="text-xs text-muted-foreground ml-1 font-bold">{row.unit}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-slate-50 border-t-2">
                                        <TableCell colSpan={3} className="px-6 font-black text-right uppercase tracking-wider text-xs">Total Tracked Emissions</TableCell>
                                        <TableCell className="px-6 text-right text-emerald-600">
                                            <span className="font-black text-xl">234.76</span>
                                            <span className="text-xs ml-1 font-bold">tCO2e</span>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="disclosures" className="flex-1 mt-6">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4 space-y-4">
                            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-lg">Framework Mappings</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Standard</label>
                                        <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gri">GRI Universal Standards</SelectItem>
                                                <SelectItem value="sasb">SASB Standards</SelectItem>
                                                <SelectItem value="tcfd">TCFD Recommendations</SelectItem>
                                                <SelectItem value="csrd">CSRD / ESRS (EU)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button className="w-full bg-slate-900"><FileText className="h-4 w-4 mr-2" /> Generate Disclosure Report</Button>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-span-8">
                            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl h-full">
                                <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                                    <CardTitle className="text-lg">Generated Reports Archive</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {DISCLOSURES.map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center ring-1 ring-indigo-200">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{doc.name}</h4>
                                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Generated: {doc.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className={
                                                    cn("text-xs uppercase font-bold tracking-wider",
                                                        doc.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            doc.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-sky-50 text-sky-700 border-sky-200')
                                                }>
                                                    {doc.status}
                                                </Badge>
                                                <Button size="sm" variant="ghost" className="h-8"><Download className="h-4 w-4 mr-2" /> PDF</Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="factors" className="flex-1 mt-6">
                    {/* Placeholder for Conversion Factors grid */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <Calculator className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">Standardized Conversion Factors</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">Manage library of EPA, DEFRA, and IPCC emissions factors used to calculate carbon equivalence.</p>
                            <Button className="mt-6" variant="outline">Manage Library</Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
