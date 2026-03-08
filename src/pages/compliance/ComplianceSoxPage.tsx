import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle, AlertTriangle, ClipboardList, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const controls = [
    { id: "SOX-101", desc: "Financial Close — Management Review", process: "GL", owner: "CFO", tested: true, effective: true, completeness: 100 },
    { id: "SOX-102", desc: "Journal Entry Approval Workflow", process: "GL", owner: "Controller", tested: true, effective: true, completeness: 100 },
    { id: "SOX-103", desc: "AP Invoice 3-Way Match", process: "AP", owner: "AP Manager", tested: true, effective: true, completeness: 100 },
    { id: "SOX-104", desc: "Vendor Master Change Authorisation", process: "AP", owner: "CFO", tested: true, effective: false, completeness: 60 },
    { id: "SOX-105", desc: "Bank Account Reconciliation", process: "Treasury", owner: "Treasury Mgr", tested: true, effective: true, completeness: 100 },
    { id: "SOX-106", desc: "Segregation of Duties Monitoring", process: "IT", owner: "CISO", tested: false, effective: false, completeness: 0 },
    { id: "SOX-107", desc: "Payroll Master File Change Control", process: "HCM", owner: "HR Director", tested: true, effective: true, completeness: 100 },
];

export default function ComplianceSoxPage() {
    const tested = controls.filter(c => c.tested).length;
    const effective = controls.filter(c => c.effective).length;
    const overallPct = Math.round((effective / controls.length) * 100);

    return (
        <StandardPage
            title="SOX Compliance"
            description="Sarbanes-Oxley Section 302/404 control testing, documentation and sign-off workbench"
            breadcrumbs={[{ label: "Compliance", href: "/compliance/dashboard" }, { label: "SOX" }]}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "SOX Controls", value: controls.length, icon: Lock, color: "text-blue-500" },
                    { label: "Tested", value: tested, icon: ClipboardList, color: "text-purple-500" },
                    { label: "Effective", value: effective, icon: CheckCircle, color: "text-green-500" },
                    { label: "Overall Score", value: `${overallPct}%`, icon: AlertTriangle, color: overallPct >= 90 ? "text-green-500" : "text-amber-500" },
                ].map((kpi) => (
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        SOX Control Testing Register
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {controls.map((ctrl) => (
                            <div key={ctrl.id} className="p-4 border rounded-lg hover:bg-muted/40 transition-colors">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-muted-foreground">{ctrl.id}</span>
                                            <Badge variant="outline" className="text-xs">{ctrl.process}</Badge>
                                        </div>
                                        <p className="text-sm font-medium">{ctrl.desc}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Owner: {ctrl.owner}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Badge className={ctrl.tested ? "bg-blue-100 text-blue-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                                            {ctrl.tested ? "Tested" : "Not Tested"}
                                        </Badge>
                                        <Badge className={ctrl.effective ? "bg-green-100 text-green-800 border-0" : "bg-red-100 text-red-800 border-0"}>
                                            {ctrl.effective ? "Effective" : "Finding"}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={ctrl.completeness} className="h-1.5" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
