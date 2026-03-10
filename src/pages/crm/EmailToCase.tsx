import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Mail, Settings, Plus, Router, MessageSquare, AlertTriangle, ArrowRight, Activity, Inbox } from "lucide-react";

interface RoutingRule {
    id: string;
    condition: string;
    keyword: string;
    action: string;
    queue: string;
    active: boolean;
}

export default function EmailToCase() {
    const [rules, setRules] = useState<RoutingRule[]>([
        { id: "R-101", condition: "Subject contains", keyword: "Urgent, Outage, Down", action: "Set Priority High", queue: "Tier 3 Escalation", active: true },
        { id: "R-102", condition: "Body contains", keyword: "password, login, reset", action: "Auto-Reply Article", queue: "Tier 1 Support", active: true },
        { id: "R-103", condition: "Sender Domain is", keyword: "@acme.com", action: "Flag as Enterprise", queue: "Acme Dedicated Pod", active: true },
        { id: "R-104", condition: "AI Sentiment is", keyword: "Very Negative", action: "Escalate immediately", queue: "Customer Success", active: false }
    ]);

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    return (
        <StandardPage
            title="Email-to-Case Configuration"
            description="Manage inbound support aliases, auto-responses, and intelligent queue routing rules."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Service Cloud", href: "/crm/cases" },
                { label: "Email-to-Case" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="col-span-1 shadow-sm border-blue-100">
                    <CardHeader className="bg-blue-50/50 pb-4 border-b">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Inbox className="h-5 w-5 text-blue-600" /> Active Inbound Aliases
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between p-4 border-b hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <div>
                                    <p className="font-semibold text-slate-800">support@nexusai.com</p>
                                    <p className="text-xs text-muted-foreground">Default Support Queue • 1.2k avg/day</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border-b hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <div>
                                    <p className="font-semibold text-slate-800">billing@nexusai.com</p>
                                    <p className="text-xs text-muted-foreground">Finance Queue • 450 avg/day</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"></div>
                                <div>
                                    <p className="font-semibold text-slate-800">vip@nexusai.com</p>
                                    <p className="text-xs text-amber-600 font-medium">Authentication Error</p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600"><Settings className="h-4 w-4" /></Button>
                        </div>
                        <div className="p-4 bg-slate-50 border-t">
                            <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                                <Plus className="h-4 w-4 mr-2" /> Connect New Alias
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-2 space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Router className="h-5 w-5 text-primary" /> Routing Engine Rules
                                    </CardTitle>
                                    <CardDescription>Parse inbound emails and automatically assign queues and priorities.</CardDescription>
                                </div>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Add Rule
                                </Button>
                            </div>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[50px]">Active</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Target Action</TableHead>
                                    <TableHead>Destination Queue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map(rule => (
                                    <TableRow key={rule.id} className={!rule.active ? "opacity-50 grayscale" : ""}>
                                        <TableCell>
                                            <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-muted-foreground uppercase font-semibold">{rule.condition}</span>
                                                <Badge variant="outline" className="w-fit bg-slate-50 font-mono text-xs">"{rule.keyword}"</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm font-medium text-slate-700">
                                                {rule.action} <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                                {rule.queue}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <Card className="border shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-slate-600" /> Auto-Response Templates</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800">New Case Created (Default)</h3>
                                            <p className="text-xs text-muted-foreground">Sent immediately upon ingestion.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border text-sm text-slate-600 font-mono">
                                        Hi &#123;&#123;contact.firstName&#125;&#125;,<br /><br />
                                        We received your request. Your case number is <b>&#123;&#123;case.number&#125;&#125;</b>...
                                    </div>
                                    <Button variant="link" className="px-0 text-primary h-auto">Edit Template</Button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800">Out of Office (Weekend)</h3>
                                            <p className="text-xs text-muted-foreground">Sent outside business hours.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border text-sm text-slate-600 font-mono">
                                        Our support hours are Mon-Fri 9AM-5PM EST.<br />
                                        We will review <b>&#123;&#123;case.subject&#125;&#125;</b> on the next business day...
                                    </div>
                                    <Button variant="link" className="px-0 text-primary h-auto">Edit Template</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
