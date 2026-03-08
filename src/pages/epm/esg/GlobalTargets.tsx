import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";

const targets = [
    {
        name: "Net Zero by 2040",
        category: "Climate",
        progress: 38,
        baseline: "2020 emissions",
        target: "0 tCO₂e by 2040",
        status: "On Track",
    },
    {
        name: "100% Renewable Energy",
        category: "Energy",
        progress: 67,
        baseline: "12% renewable (2020)",
        target: "100% renewable by 2030",
        status: "On Track",
    },
    {
        name: "Zero Waste to Landfill",
        category: "Waste",
        progress: 52,
        baseline: "1,200t landfill (2020)",
        target: "0t by 2035",
        status: "At Risk",
    },
    {
        name: "Water Neutrality",
        category: "Water",
        progress: 25,
        baseline: "8.2M m³ (2020)",
        target: "Neutral by 2035",
        status: "At Risk",
    },
    {
        name: "50% Women in Leadership",
        category: "Social",
        progress: 81,
        baseline: "31% (2020)",
        target: "50% by 2027",
        status: "On Track",
    },
];

const statusBadge = (status: string) => (
    <Badge variant={status === "On Track" ? "default" : "destructive"} className="text-xs">
        {status === "On Track"
            ? <CheckCircle className="h-3 w-3 mr-1" />
            : <AlertCircle className="h-3 w-3 mr-1" />}
        {status}
    </Badge>
);

export default function GlobalTargets() {
    return (
        <StandardPage
            title="Global ESG Targets"
            description="Long-term sustainability commitments and progress tracking"
        >
            <div className="flex justify-end mb-4">
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Target
                </Button>
            </div>

            <div className="space-y-4">
                {targets.map((t) => (
                    <Card key={t.name}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle className="text-sm font-medium">{t.name}</CardTitle>
                                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                                </div>
                                {statusBadge(t.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                            <div className="text-xs text-muted-foreground">Baseline: {t.baseline} → Target: {t.target}</div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-muted rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${t.progress >= 60 ? "bg-green-500" : t.progress >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                        style={{ width: `${t.progress}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold w-10 text-right">{t.progress}%</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </StandardPage>
    );
}
