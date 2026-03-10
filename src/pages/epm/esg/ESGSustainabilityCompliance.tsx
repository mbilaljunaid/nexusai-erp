import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, CheckCircle, AlertCircle, Globe, FileText, BarChart3 } from "lucide-react";

const frameworks = [
    { name: "GRI Standards", status: "Active", score: 92, color: "text-green-500" },
    { name: "SASB", status: "Active", score: 88, color: "text-green-500" },
    { name: "TCFD", status: "In Progress", score: 74, color: "text-amber-500" },
    { name: "UN SDG Alignment", status: "In Progress", score: 68, color: "text-amber-500" },
];

const kpis = [
    { label: "Frameworks Tracked", value: "4", icon: Globe, color: "text-blue-500" },
    { label: "Avg Compliance Score", value: "80%", icon: CheckCircle, color: "text-green-500" },
    { label: "Open Gap Items", value: "12", icon: AlertCircle, color: "text-amber-500" },
    { label: "Reports Submitted", value: "3", icon: FileText, color: "text-purple-500" },
];

export default function ESGSustainabilityCompliance() {
    return (
        <StandardPage
            title="Sustainability Compliance"
            description="Framework compliance tracking — GRI, SASB, TCFD, UN SDGs"
        >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="flex items-center gap-3 p-4">
                            <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                            <div>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Framework Status</h3>
                {frameworks.map((fw) => (
                    <Card key={fw.name}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Leaf className={`h-4 w-4 ${fw.color}`} />
                                    {fw.name}
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Badge variant={fw.status === "Active" ? "default" : "outline"}>{fw.status}</Badge>
                                    <div className="flex items-center gap-1">
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold">{fw.score}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${fw.score >= 80 ? "bg-green-500" : "bg-amber-500"}`}
                                    style={{ width: `${fw.score}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </StandardPage>
    );
}
