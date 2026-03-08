import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle, Plus, Clock } from "lucide-react";

const incidents = [
    {
        id: "ESG-001",
        title: "Waste disposal non-compliance — Site B",
        category: "Environmental",
        severity: "High",
        status: "Open",
        reported: "2026-02-14",
    },
    {
        id: "ESG-002",
        title: "Supply chain child labour allegation",
        category: "Social",
        severity: "Critical",
        status: "Under Investigation",
        reported: "2026-01-28",
    },
    {
        id: "ESG-003",
        title: "Board diversity ratio below target",
        category: "Governance",
        severity: "Medium",
        status: "Remediation",
        reported: "2026-01-10",
    },
    {
        id: "ESG-004",
        title: "Water discharge permit exceeded",
        category: "Environmental",
        severity: "High",
        status: "Resolved",
        reported: "2025-12-05",
    },
];

const severityColor = (s: string) =>
    s === "Critical" ? "destructive" : s === "High" ? "outline" : "secondary";

const statusIcon = (s: string) => {
    if (s === "Resolved") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (s === "Open") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
};

export default function ESGRiskIncidents() {
    return (
        <StandardPage
            title="ESG Risk & Incidents"
            description="Environmental, social, and governance risk events and remediation tracking"
        >
            <div className="flex justify-end mb-4">
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Report Incident
                </Button>
            </div>

            <div className="space-y-3">
                {incidents.map((inc) => (
                    <Card key={inc.id}>
                        <CardContent className="flex items-start justify-between p-4">
                            <div className="flex items-start gap-3">
                                {statusIcon(inc.status)}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                                        <Badge variant="outline" className="text-xs">{inc.category}</Badge>
                                        <Badge variant={severityColor(inc.severity)} className="text-xs">{inc.severity}</Badge>
                                    </div>
                                    <p className="font-medium text-sm">{inc.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Reported: {inc.reported}</p>
                                </div>
                            </div>
                            <Badge variant={inc.status === "Resolved" ? "default" : "outline"}>
                                {inc.status}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </StandardPage>
    );
}
