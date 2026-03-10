import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, CheckCircle, Clock, Plus, PenTool, Edit, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface ContractTerm {
    id: string;
    title: string;
    category: string;
    version: string;
    lastUpdated: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
}

interface SignatureRequest {
    id: string;
    quoteName: string;
    customer: string;
    amount: number;
    sentDate: string;
    status: "PENDING" | "SIGNED" | "DECLINED";
    envelopeId: string;
}

export default function ContractLifecycleManagement() {
    const [activeTab, setActiveTab] = useState<"library" | "signatures">("library");

    const termsLibrary: ContractTerm[] = [
        { id: "T-001", title: "Standard MSA - Enterprise", category: "Master Service Agreement", version: "v2.4", lastUpdated: "2026-02-15", status: "ACTIVE" },
        { id: "T-002", title: "Standard MSA - MidMarket", category: "Master Service Agreement", version: "v1.8", lastUpdated: "2026-01-20", status: "ACTIVE" },
        { id: "T-003", title: "Data Processing Addendum (GDPR)", category: "Compliance", version: "v4.0", lastUpdated: "2025-11-10", status: "ACTIVE" },
        { id: "T-004", title: "SLA - High Availability 99.99%", category: "Service Level Agreement", version: "v1.1", lastUpdated: "2026-03-01", status: "ACTIVE" },
        { id: "T-005", title: "Early Adopter Discount Terms", category: "Pricing", version: "v1.0", lastUpdated: "2026-03-08", status: "DRAFT" },
    ];

    const signatureRequests: SignatureRequest[] = [
        { id: "SIG-8492", quoteName: "Acme Corp Q3 Renewal", customer: "Acme Corp", amount: 125000, sentDate: "2026-03-09", status: "PENDING", envelopeId: "ENV-A92B-4X9" },
        { id: "SIG-8491", quoteName: "Stark Ind - New Implementation", customer: "Stark Industries", amount: 450000, sentDate: "2026-03-08", status: "SIGNED", envelopeId: "ENV-J83K-1L2" },
        { id: "SIG-8490", quoteName: "Globex 500 Seat Expansion", customer: "Globex Corp", amount: 75000, sentDate: "2026-03-05", status: "DECLINED", envelopeId: "ENV-M55N-0P1" },
    ];

    return (
        <StandardPage
            title="Contract Lifecycle Management"
            description="Manage standard contract terms, view inclusion rules, and track electronic signature routing."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "CPQ", href: "/crm/cpq" },
                { label: "Contracts & Signatures" }
            ]}
        >
            <div className="flex bg-muted p-1 rounded-lg border w-fit mb-6 shadow-sm">
                <Button
                    variant={activeTab === "library" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("library")}
                    className={`h-9 px-6 transition-all ${activeTab === 'library' ? 'bg-background shadow font-medium' : ''}`}
                >
                    <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                    Terms Library
                </Button>
                <Button
                    variant={activeTab === "signatures" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("signatures")}
                    className={`h-9 px-6 transition-all ${activeTab === 'signatures' ? 'bg-background shadow font-medium' : ''}`}
                >
                    <PenTool className="h-4 w-4 mr-2 text-blue-500" />
                    E-Signatures
                </Button>
            </div>

            {activeTab === "library" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                Terms Library
                                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">5 Active</Badge>
                            </CardTitle>
                            <CardDescription>
                                Standardized legal clauses and agreements to be automatically included in quotes based on product configurator rules.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search terms or clauses..." className="pl-9 h-9" />
                            </div>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" /> Add Term
                            </Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Term / Clause Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {termsLibrary.map(term => (
                                    <TableRow key={term.id}>
                                        <TableCell className="font-medium text-primary">
                                            {term.title}
                                            <div className="text-xs text-muted-foreground font-normal mt-0.5">{term.id}</div>
                                        </TableCell>
                                        <TableCell>{term.category}</TableCell>
                                        <TableCell><Badge variant="outline">{term.version}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{term.lastUpdated}</TableCell>
                                        <TableCell>
                                            <Badge variant={term.status === 'ACTIVE' ? 'default' : term.status === 'DRAFT' ? 'secondary' : 'outline'}
                                                className={term.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200' : ''}>
                                                {term.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-muted-foreground" /></Button>
                                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            )}

            {activeTab === "signatures" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-amber-500">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Signatures</p>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                                <Clock className="h-8 w-8 text-amber-500/20" />
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Signed This Month</p>
                                    <p className="text-2xl font-bold">48</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500/20" />
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg. Turnaround</p>
                                    <p className="text-2xl font-bold">2.4 Days</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-500/20" />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent E-Signature Envelopes</CardTitle>
                                <CardDescription>Track the status of quotes sent out for digital signature.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" /> Filter
                            </Button>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Envelope ID</TableHead>
                                    <TableHead>Quote Reference</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Sent Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {signatureRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{req.envelopeId}</TableCell>
                                        <TableCell className="font-medium text-primary cursor-pointer hover:underline">{req.quoteName}</TableCell>
                                        <TableCell>{req.customer}</TableCell>
                                        <TableCell className="font-medium">${req.amount.toLocaleString()}</TableCell>
                                        <TableCell>{req.sentDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'SIGNED' ? 'default' : req.status === 'DECLINED' ? 'destructive' : 'secondary'}
                                                className={req.status === 'SIGNED' ? 'bg-green-500/10 text-green-700 border-green-200' : req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-700 border-amber-200' : ''}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-blue-600">View Envelope</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            )}
        </StandardPage>
    );
}
