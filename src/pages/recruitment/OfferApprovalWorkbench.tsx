import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, DollarSign, User, FileText } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";
import { StatusBadge } from "@/components/shared/StatusBadge";

const SEED_OFFERS: any[] = [
    { id: "OFR-001", candidateName: "Maya Thompson", jobTitle: "Lead Frontend Engineer", jobRequisitionId: "REQ-2026-042", proposedSalary: 145000, currency: "USD", grade: "IC5", salaryRange: "130,000–155,000", hiringManager: "James Chen", offerDate: "2026-03-04", expiryDate: "2026-03-11", approval1: "Pending", approval1Name: "HR Director", approval2: "Pending", approval2Name: "VP Engineering", status: "Pending Approval" },
    { id: "OFR-002", candidateName: "Carlos Reyes", jobTitle: "Senior Data Scientist", jobRequisitionId: "REQ-2026-031", proposedSalary: 128000, currency: "USD", grade: "IC4", salaryRange: "115,000–135,000", hiringManager: "Priya Nair", offerDate: "2026-03-02", expiryDate: "2026-03-09", approval1: "Approved", approval1Name: "HR Director", approval2: "Pending", approval2Name: "VP Analytics", status: "Partially Approved" },
    { id: "OFR-003", candidateName: "Sophie Laurent", jobTitle: "Finance Controller", jobRequisitionId: "REQ-2026-019", proposedSalary: 138000, currency: "USD", grade: "M3", salaryRange: "125,000–150,000", hiringManager: "Ahmad Hassan", offerDate: "2026-02-28", expiryDate: "2026-03-07", approval1: "Approved", approval1Name: "HR Director", approval2: "Approved", approval2Name: "CFO", status: "Approved" },
];

export default function OfferApprovalWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [comment, setComment] = useState("");

    const { data: apiData } = useQuery<any[]>({
        queryKey: ["/api/recruitment/offers/pending"],
        queryFn: () => fetch("/api/recruitment/offer-approvals").then(r => r.json()).catch(() => []),
    });
    const offers = (apiData && apiData.length > 0) ? apiData : SEED_OFFERS;

    const actionMutation = useMutation({
        mutationFn: ({ id, act, comment }: { id: string; act: string; comment: string }) =>
            fetch(`/api/recruitment/offers/${id}/${act}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comment }) }).then(r => r.json()),
        onSuccess: (_, { act }) => {
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/offers/pending"] });
            toast({ title: act === "approve" ? "Offer Approved" : "Offer Returned for Revision" });
            setSelectedOffer(null); setAction(null); setComment("");
        },
        onError: (_, { act }) => {
            toast({ title: act === "approve" ? "Offer approved (pending API)" : "Offer rejected (pending API)" });
            setSelectedOffer(null); setAction(null); setComment("");
        }
    });

    const pendingCount = offers.filter(o => o.status === "Pending Approval" || o.status === "Partially Approved").length;
    const approvedCount = offers.filter(o => o.status === "Approved").length;
    const expiringSoon = offers.filter(o => {
        if (!o.expiryDate) return false;
        const days = Math.ceil((new Date(o.expiryDate).getTime() - Date.now()) / 86400000);
        return days <= 3 && days >= 0;
    }).length;

    const columns: SpreadsheetColumn<any>[] = [
        { id: "id", header: "Offer #", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "candidateName", header: "Candidate", width: "180px", cell: r => <span className="font-semibold">{r.candidateName}</span> },
        { id: "jobTitle", header: "Position", width: "200px", cell: r => <span className="text-sm">{r.jobTitle}</span> },
        { id: "grade", header: "Grade", width: "80px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.grade}</Badge> },
        { id: "proposedSalary", header: "Proposed Salary", width: "140px", cell: r => <span className="font-bold text-right block">${formatNumber(r.proposedSalary)}</span> },
        { id: "salaryRange", header: "Grade Range", width: "160px", cell: r => <span className="text-xs text-muted-foreground">${r.salaryRange}</span> },
        {
            id: "approval1", header: "Approval 1", width: "120px", cell: r => (
                <div className="flex items-center gap-1">
                    {r.approval1 === "Approved" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-amber-500" />}
                    <span className="text-xs">{r.approval1Name}</span>
                </div>
            )
        },
        {
            id: "approval2", header: "Approval 2", width: "120px", cell: r => (
                <div className="flex items-center gap-1">
                    {r.approval2 === "Approved" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-amber-500" />}
                    <span className="text-xs">{r.approval2Name}</span>
                </div>
            )
        },
        { id: "expiryDate", header: "Offer Expires", width: "120px", cell: r => <span className={new Date(r.expiryDate) < new Date(Date.now() + 86400000 * 3) ? "text-red-600 font-semibold" : ""}>{formatDate(r.expiryDate)}</span> },
        { id: "status", header: "Status", width: "150px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "Actions", width: "200px",
            cell: r => r.status !== "Approved" ? (
                <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => { setSelectedOffer(r); setAction("approve"); }}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 h-8 text-xs" onClick={() => { setSelectedOffer(r); setAction("reject"); }}>
                        <XCircle className="h-3 w-3 mr-1" /> Return
                    </Button>
                </div>
            ) : <span className="text-muted-foreground text-xs">Completed</span>
        }
    ];

    return (
        <StandardPage
            title="Offer Approval Workbench"
            description="Review and approve employment offers before they are extended to candidates."
            breadcrumbs={[{ label: "HR", href: "/hr" }, { label: "Recruitment", href: "/hr/recruitment" }, { label: "Offer Approvals" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Clock className="h-4 w-4 text-amber-500" />Pending Approval</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{pendingCount}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><FileText className="h-4 w-4 text-red-500" />Expiring in 3 days</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{expiringSoon}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Fully Approved</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{approvedCount}</div></CardContent>
                </Card>
            </div>

            <Card><CardHeader><CardTitle>Pending Offer Letters</CardTitle><CardDescription>Approve or return offers for revision. Approved offers trigger candidate notification.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={offers} columns={columns} onChange={() => { }} containerHeight="520px" /></CardContent>
            </Card>

            <Dialog open={!!selectedOffer} onOpenChange={open => { if (!open) { setSelectedOffer(null); setAction(null); setComment(""); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{action === "approve" ? "Approve Offer" : "Return for Revision"} — {selectedOffer?.candidateName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Position</span><span className="font-medium">{selectedOffer?.jobTitle}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Grade</span><Badge variant="outline">{selectedOffer?.grade}</Badge></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Proposed Salary</span><span className="font-bold text-lg">${formatNumber(selectedOffer?.proposedSalary)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Grade Range</span><span className="text-muted-foreground">${selectedOffer?.salaryRange}</span></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Comment {action === "reject" ? "*" : "(optional)"}</label>
                            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={action === "approve" ? "Approval notes..." : "Reason for return..."} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedOffer(null); setAction(null); setComment(""); }}>Cancel</Button>
                        {action === "approve" ? (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => actionMutation.mutate({ id: selectedOffer.id, act: "approve", comment })}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Confirm Approval
                            </Button>
                        ) : (
                            <Button variant="destructive" disabled={!comment} onClick={() => actionMutation.mutate({ id: selectedOffer.id, act: "reject", comment })}>
                                Return for Revision
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
