import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Handshake,
    FileCheck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Send,
    UserCheck,
    DollarSign,
    Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from "@/components/layout/StandardPage";


export default function OfferManagementWorkbench() {
    const { toast } = useToast();
    const [filterStatus, setFilterStatus] = useState("all");

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ["/api/recruitment/offers"],
        queryFn: async () => {
            // Mocking offer list for V1
            return [
                { id: "OFF-001", candidate: "Alice Johnson", role: "Sr. Software Engineer", salary: "$165,000", status: "PENDING_APPROVAL", approvalStep: 2, totalSteps: 3 },
                { id: "OFF-002", candidate: "Bob Smith", role: "Product Manager", salary: "$140,000", status: "APPROVED", approvalStep: 3, totalSteps: 3 },
                { id: "OFF-003", candidate: "Charlie Brown", role: "DevOps Engineer", salary: "$155,000", status: "DRAFT", approvalStep: 0, totalSteps: 3 }
            ];
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/recruitment/offers/${id}/approve`, { method: "POST" });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Offer Approved", description: "The workflow has advanced to the next stage." });
        }
    });

    return (
        <StandardPage title="Offer Management">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground mt-1">Manage the end-to-end offer lifecycle and internal approvals.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                    <DollarSign className="w-4 h-4 mr-2" /> New Offer Package
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-blue-50/50">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-semibold uppercase text-blue-600">Total Offers</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">12</CardContent>
                </Card>
                <Card className="bg-orange-50/50">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-semibold uppercase text-orange-600">Pending Approval</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">4</CardContent>
                </Card>
                <Card className="bg-green-50/50">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-semibold uppercase text-green-600">Accepted</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">6</CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-semibold uppercase text-slate-600">Drafts</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">2</CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Offers & Approvals</CardTitle>
                    <CardDescription>Track real-time status of extended offers and internal sign-offs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {offers.map((offer) => (
                            <div key={offer.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <FileCheck className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold flex items-center gap-2">
                                                {offer.candidate}
                                                <Badge variant="outline" className="text-[10px] font-normal">{offer.id}</Badge>
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{offer.role} • {offer.salary}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 max-w-xs space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium uppercase text-muted-foreground">
                                            <span>Approval Cycle</span>
                                            <span>Step {offer.approvalStep} of {offer.totalSteps}</span>
                                        </div>
                                        <Progress value={(offer.approvalStep / offer.totalSteps) * 100} className="h-1.5" />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={
                                                offer.status === "APPROVED" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                                    offer.status === "PENDING_APPROVAL" ? "bg-orange-100 text-orange-700 hover:bg-orange-100" :
                                                        "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                            }
                                        >
                                            {offer.status.replace("_", " ")}
                                        </Badge>
                                        <div className="flex gap-2">
                                            {offer.status === "PENDING_APPROVAL" && (
                                                <Button size="sm" onClick={() => approveMutation.mutate(offer.id)}>Approve</Button>
                                            )}
                                            {offer.status === "APPROVED" && (
                                                <Button size="sm" variant="outline"><Send className="w-3 h-3 mr-2" /> Send to Candidate</Button>
                                            )}
                                            <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2"><UserCheck className="w-3 h-3" /> Hiring Manager: Sarah Collins</div>
                                    <div className="flex items-center gap-2"><DollarSign className="w-3 h-3" /> Budget Approved by: Finance (V. Patel)</div>
                                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Target Start: Sept 15, 2026</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}

function MoreHorizontal(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
        </svg>
    )
}
