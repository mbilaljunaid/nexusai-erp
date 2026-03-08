import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CheckCircle, AlertTriangle, FileText, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const controls = [
    { id: "CTRL-001", name: "Segregation of Duties — AP", area: "Finance", framework: "COSO", status: "Effective", risk: "Low" },
    { id: "CTRL-002", name: "Journal Entry Approval", area: "Finance", framework: "SOX", status: "Effective", risk: "Low" },
    { id: "CTRL-003", name: "User Access Review", area: "IT", framework: "ISO 27001", status: "Needs Remediation", risk: "High" },
    { id: "CTRL-004", name: "Vendor Master Changes", area: "Procurement", framework: "COSO", status: "Effective", risk: "Medium" },
    { id: "CTRL-005", name: "Bank Reconciliation Sign-off", area: "Treasury", framework: "SOX", status: "Effective", risk: "Low" },
    { id: "CTRL-006", name: "Expense Report Approval", area: "Finance", framework: "COSO", status: "Effective", risk: "Low" },
    { id: "CTRL-007", name: "Asset Disposal Authorisation", area: "Fixed Assets", framework: "COSO", status: "Not Tested", risk: "Medium" },
    { id: "CTRL-008", name: "Payroll Change Authorisation", area: "HCM", framework: "SOX", status: "Effective", risk: "Low" },
];

function statusBadge(status: string) {
    if (status === "Effective") return <Badge className="bg-green-100 text-green-800 border-0">Effective</Badge>;
    if (status === "Needs Remediation") return <Badge className="bg-red-100 text-red-800 border-0">Needs Remediation</Badge>;
    return <Badge className="bg-amber-100 text-amber-800 border-0">Not Tested</Badge>;
}

function riskBadge(risk: string) {
    if (risk === "Low") return <Badge variant="outline" className="text-green-600">Low</Badge>;
    if (risk === "High") return <Badge variant="outline" className="text-red-600">High</Badge>;
    return <Badge variant="outline" className="text-amber-600">Medium</Badge>;
}

export default function ComplianceControlsPage() {
    const effective = controls.filter(c => c.status === "Effective").length;
    const issues = controls.filter(c => c.status !== "Effective").length;

    return (
        <StandardPage
            title="Internal Control Framework"
            description="COSO + SOX control register, testing status, and remediation tracking"
            breadcrumbs={[{ label: "Compliance", href: "/compliance/dashboard" }, { label: "Controls" }]}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Controls", value: controls.length, icon: ClipboardList, color: "text-blue-500" },
                    { label: "Effective", value: effective, icon: CheckCircle, color: "text-green-500" },
                    { label: "Issues / Not Tested", value: issues, icon: AlertTriangle, color: "text-amber-500" },
                    { label: "Frameworks", value: 3, icon: ShieldCheck, color: "text-purple-500" },
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
                        Control Register
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="text-left py-3 pr-4">Control ID</th>
                                    <th className="text-left py-3 pr-4">Control Name</th>
                                    <th className="text-left py-3 pr-4">Area</th>
                                    <th className="text-left py-3 pr-4">Framework</th>
                                    <th className="text-left py-3 pr-4">Risk</th>
                                    <th className="text-left py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {controls.map((ctrl) => (
                                    <tr key={ctrl.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{ctrl.id}</td>
                                        <td className="py-3 pr-4 font-medium">{ctrl.name}</td>
                                        <td className="py-3 pr-4 text-muted-foreground">{ctrl.area}</td>
                                        <td className="py-3 pr-4">{ctrl.framework}</td>
                                        <td className="py-3 pr-4">{riskBadge(ctrl.risk)}</td>
                                        <td className="py-3">{statusBadge(ctrl.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
