import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SmartViewIntegration() {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const exportData = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            toast({ title: "Smart View Export Complete", description: "Downloaded Budget_Plan_Export.xlsx" });
        }, 1500);
    };

    const importData = () => {
        setIsImporting(true);
        setTimeout(() => {
            setIsImporting(false);
            toast({ title: "Data Imported successfully", description: "45 rows updated from spreadsheet." });
        }, 1500);
    };

    return (
        <StandardPage
            title="Smart View Integration (EPM)"
            description="Excel integration for high-volume multidimensional data entry and refresh."
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Smart View" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" /> Export to Smart View</CardTitle>
                        <CardDescription>Export EPM forms and ad-hoc grids to Excel for offline modeling.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Plan Scenario</Label>
                            <Select defaultValue="fy26_budget">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fy26_budget">FY26 Annual Budget</SelectItem>
                                    <SelectItem value="q1_forecast">Q1 Rolling Forecast</SelectItem>
                                    <SelectItem value="what_if_mna">What-If: M&A Scenario</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Dimensional Slice</Label>
                            <Select defaultValue="all_departments">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_departments">All Departments</SelectItem>
                                    <SelectItem value="sales_only">Sales Ops Only</SelectItem>
                                    <SelectItem value="eng_only">Engineering Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-4">
                            <Button className="w-full" onClick={exportData} disabled={isExporting}>
                                {isExporting ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                                {isExporting ? "Generating..." : "Export to Excel"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-green-600" /> Import & Submit Data</CardTitle>
                        <CardDescription>Submit updated spreadsheet data back to the Essbase calculation engine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border border-dashed p-8 rounded-lg text-center bg-slate-50 flex flex-col items-center justify-center">
                            <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-1">Drag & Drop Smart View File</h3>
                            <p className="text-sm text-muted-foreground mb-4">Support .xlsx files with Smart View POV metadata.</p>
                            <Input type="file" className="max-w-[250px]" accept=".xlsx" />
                        </div>
                        <Button variant="default" className="w-full" onClick={importData} disabled={isImporting}>
                            {isImporting ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isImporting ? "Processing..." : "Submit Data"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 mt-4 border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="text-sm">Engine Status: Essbase Emulator</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-green-600">Online</Badge>
                            <span className="text-muted-foreground">In-Memory Store: 42.5 MB</span>
                            <span className="text-muted-foreground">Active Blocks: 1,402</span>
                        </div>
                        <Button variant="outline" size="sm"><RefreshCcw className="w-3 h-3 mr-2" /> Force Calculation Aggregation</Button>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
