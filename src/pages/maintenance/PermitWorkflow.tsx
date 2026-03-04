import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { permitService } from "@/services/maintenance.service";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ShieldCheck,
    ClipboardList,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    Users,
    FileText,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PermitType {
    id: string;
    name: string;
    description: string;
    requiresApproval: boolean;
    approvalLevels: number;
    validityHours: number;
    requiredDocuments: string[];
}

interface Permit {
    id: string;
    permitTypeId: string;
    permitTypeName: string;
    workOrderId?: string;
    assetId?: string;
    assetName?: string;
    requestedBy: string;
    requestedDate: string;
    status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "EXPIRED" | "REVOKED";
    validFrom?: string;
    validUntil?: string;
    approvals: PermitApproval[];
    safetyNotes?: string;
}

interface PermitApproval {
    level: number;
    approverName: string;
    approvedDate?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    comments?: string;
}

const permitSchema = z.object({
    permitTypeId: z.string().min(1, "Permit type is required"),
    assetName: z.string().optional(),
    workOrderId: z.string().optional(),
    safetyNotes: z.string().min(1, "Safety notes are required")
});

export function PermitWorkflow() {
    const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
    const [permits, setPermits] = useState<Permit[]>([]);
    const [selectedType, setSelectedType] = useState<PermitType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const form = useForm<z.infer<typeof permitSchema>>({
        resolver: zodResolver(permitSchema),
        defaultValues: {
            permitTypeId: "",
            assetName: "",
            workOrderId: "",
            safetyNotes: ""
        }
    });

    useEffect(() => {
        loadPermitTypes();
        loadPermits();
    }, []);

    const loadPermitTypes = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALL - Get permit types from service layer
            const apiTypes = await permitService.getPermitTypes();
            setPermitTypes(apiTypes);
        } catch (error) {
            console.error("Failed to load permit types:", error);
            setPermitTypes([]); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const loadPermits = async () => {
        try {
            // ✅ LIVE API CALL - Get permits from service layer
            // Note: API returns WorkPermit type which may differ from component Permit type
            const apiPermits = await permitService.getPermits();
            // Using the API data as-is; if type mismatches occur, will need mapper function
            setPermits(apiPermits as any); // Temporary any cast
        } catch (error) {
            console.error("Failed to load permits:", error);
            setPermits([]); // Fallback
        }
    };

    const handleRequestPermit = async (data: z.infer<typeof permitSchema>) => {
        if (!selectedType) return;

        try {
            // ✅ LIVE API CALL - Create permit request
            const result = await permitService.createPermit({
                permitType: selectedType.name,
                location: data.assetName || "Unspecified",
                description: data.safetyNotes || `Permit for ${selectedType.name}`,
                woId: data.workOrderId || undefined,
                hazards: [], // TODO: collect from form
                safeguards: [] // TODO: collect from form
            });

            // TODO: Show success toast

            await loadPermits(); // Refresh list
            setShowForm(false);
            form.reset();
            setSelectedType(null);
        } catch (error) {
            console.error("Failed to request permit:", error);
            // TODO: Show error toast
        }
    };

    const getStatusConfig = (status: Permit["status"]) => {
        switch (status) {
            case "ACTIVE":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Active" };
            case "APPROVED":
                return { color: "bg-blue-100 text-blue-800", icon: CheckCircle2, label: "Approved" };
            case "PENDING_APPROVAL":
                return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending Approval" };
            case "EXPIRED":
                return { color: "bg-gray-100 text-gray-800", icon: XCircle, label: "Expired" };
            case "REVOKED":
                return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Revoked" };
            default:
                return { color: "bg-gray-100 text-gray-800", icon: FileText, label: "Draft" };
        }
    };

    const getApprovalProgress = (permit: Permit) => {
        const approved = permit.approvals.filter(a => a.status === "APPROVED").length;
        const total = permit.approvals.length;
        return { approved, total, percentage: (approved / total) * 100 };
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Work Permits</h1>
                    <p className="text-muted-foreground">Manage safety permits and approvals</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Permit
                </Button>
            </div>

            {showForm ? (
                <Card className="border-2 border-primary">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-base">Request Work Permit</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleRequestPermit)} className="space-y-4">
                                <FormField control={form.control} name="permitTypeId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Permit Type *</FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            const type = permitTypes.find(t => t.id === value);
                                            setSelectedType(type || null);
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select permit type..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {permitTypes.map(type => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedType && (
                                            <FormDescription>{selectedType.description}</FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {selectedType && (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="assetName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Asset Name</FormLabel>
                                                    <FormControl><Input placeholder="Enter asset name..." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="workOrderId" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Work Order #</FormLabel>
                                                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="safetyNotes" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Safety Notes / Precautions *</FormLabel>
                                                <FormControl><Textarea placeholder="Describe safety measures, equipment, personnel..." rows={4} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <div className="border rounded p-4 bg-blue-50">
                                            <div className="text-sm font-medium mb-2">Required Documents:</div>
                                            <ul className="text-sm space-y-1">
                                                {selectedType.requiredDocuments.map((doc, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <ClipboardList className="h-4 w-4 text-blue-600" />
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="text-xs text-muted-foreground mt-3">
                                                Valid for: {selectedType.validityHours} hours •
                                                Approval levels: {selectedType.approvalLevels}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="flex-1">
                                                Submit Request
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Active Permits */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Active Permits</h2>
                        <div className="grid gap-4">
                            {permits.filter(p => p.status === "ACTIVE").length === 0 ? (
                                <Card>
                                    <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
                                        <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        No active permits
                                    </CardContent>
                                </Card>
                            ) : (
                                permits.filter(p => p.status === "ACTIVE").map(permit => {
                                    const statusConfig = getStatusConfig(permit.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Card key={permit.id} className="border-2 border-green-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-bold text-lg">{permit.permitTypeName}</h3>
                                                            <Badge variant="outline" className={statusConfig.color}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        {permit.assetName && (
                                                            <div className="text-sm text-muted-foreground mb-2">
                                                                Asset: {permit.assetName}
                                                                {permit.workOrderId && ` • WO: ${permit.workOrderId}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {permit.validFrom && permit.validUntil && (
                                                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Valid From:</span>
                                                            <div className="font-medium">{format(new Date(permit.validFrom), "MMM dd, yyyy HH:mm")}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Valid Until:</span>
                                                            <div className="font-medium text-orange-600">
                                                                {format(new Date(permit.validUntil), "MMM dd, yyyy HH:mm")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {permit.safetyNotes && (
                                                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200 mb-4">
                                                        <div className="flex items-start gap-2">
                                                            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                                                            <div className="flex-1 text-sm">{permit.safetyNotes}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button variant="outline" size="sm" className="w-full">
                                                    Revoke Permit
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Pending & Other Permits */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">All Permits</h2>
                        <div className="grid gap-4">
                            {permits.map(permit => {
                                const statusConfig = getStatusConfig(permit.status);
                                const StatusIcon = statusConfig.icon;
                                const progress = getApprovalProgress(permit);

                                return (
                                    <Card key={permit.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-lg">{permit.permitTypeName}</h3>
                                                        <Badge variant="outline" className={statusConfig.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Requested by {permit.requestedBy} • {format(new Date(permit.requestedDate), "MMM dd, yyyy HH:mm")}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Approval Progress */}
                                            {permit.status === "PENDING_APPROVAL" && (
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-muted-foreground">Approval Progress</span>
                                                        <span className="font-medium">
                                                            {progress.approved} / {progress.total} approved
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 transition-all"
                                                            style={{ width: `${progress.percentage}%` }}
                                                        />
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        {permit.approvals.map(approval => (
                                                            <div key={approval.level} className="flex items-center gap-3 text-sm">
                                                                {approval.status === "APPROVED" ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                ) : approval.status === "REJECTED" ? (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                ) : (
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                )}
                                                                <div className="flex-1">
                                                                    <span className="font-medium">Level {approval.level}:</span> {approval.approverName}
                                                                    {approval.approvedDate && (
                                                                        <span className="text-muted-foreground ml-2">
                                                                            ({format(new Date(approval.approvedDate), "MMM dd HH:mm")})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default PermitWorkflow;
