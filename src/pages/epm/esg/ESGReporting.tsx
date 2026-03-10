import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

const reports = [
    { name: "Annual ESG Report 2025", framework: "GRI", period: "FY2025", status: "Published", date: "2026-01-15" },
    { name: "TCFD Climate Report", framework: "TCFD", period: "FY2025", status: "Under Review", date: "2026-02-01" },
    { name: "SASB Disclosure", framework: "SASB", period: "FY2025", status: "Draft", date: "2026-03-01" },
    { name: "UN SDG Progress Report", framework: "SDG", period: "H2 2025", status: "Published", date: "2025-12-31" },
];

const statusIcon = (status: string) => {
    if (status === "Published") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "Under Review") return <Clock className="h-4 w-4 text-amber-500" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
};

export default function ESGReporting() {
    return (
        <StandardPage
            title="ESG Reporting"
            description="Generate, review, and publish ESG disclosure reports"
        >
            <div className="flex justify-end mb-4">
                <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    New Report
                </Button>
            </div>

            <div className="space-y-3">
                {reports.map((report) => (
                    <Card key={report.name}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {statusIcon(report.status)}
                                <div>
                                    <p className="font-medium text-sm">{report.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">{report.framework}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />{report.period}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={report.status === "Published" ? "default" : "outline"}>{report.status}</Badge>
                                {report.status === "Published" && (
                                    <Button size="sm" variant="ghost">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </StandardPage>
    );
}
