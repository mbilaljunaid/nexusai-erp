import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { StandardTable } from "../tables/StandardTable";
import { Plus, FileText, CheckCircle2, Clock, AlertCircle, Calendar, Award, Paperclip, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentViewer } from "./DocumentViewer";
import { useAnalyticsTracking } from "@/hooks/usePerformanceMonitoring";
import { generateCompliancePDF } from "./reports/CompliancePDFReport";
import { DatePicker } from '@/components/ui/DatePicker';

interface Attachment {
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

interface ComplianceRecord {
    id: string;
    recordNumber: string;
    category: "PERMIT" | "INSPECTION" | "SAFETY" | "ENVIRONMENTAL" | "QUALITY";
    title: string;
    status: "PENDING" | "APPROVED" | "EXPIRED" | "REJECTED";
    issuedDate: string;
    expiryDate?: string;
    issuingAuthority: string;
    projectId: string;
    notes?: string;
    attachments?: number;
    attachmentsList?: Attachment[];
}

interface ComplianceTrackerProps {
    projectId?: string;
}

export function ComplianceTracker({ projectId }: ComplianceTrackerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { trackComplianceExpiry, trackDocumentAction } = useAnalyticsTracking();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [viewerAttachment, setViewerAttachment] = useState<Attachment | null>(null);

    const { data: records = [], isLoading } = useQuery<ComplianceRecord[]>({
        queryKey: ["construction-compliance", projectId],
        enabled: !!projectId,
        queryFn: async () => {
            // Mock data - in production would call API
            return [
                {
                    id: "1",
                    recordNumber: "PERMIT-2026-001",
                    category: "PERMIT",
                    title: "Building Permit - Foundation Work",
                    status: "APPROVED",
                    issuedDate: "2026-01-15",
                    expiryDate: "2027-01-15",
                    issuingAuthority: "City Building Department",
                    projectId: projectId!,
                    notes: "Annual renewal required",
                    attachments: 3
                },
                {
                    id: "2",
                    recordNumber: "INSP-2026-045",
                    category: "INSPECTION",
                    title: "Structural Steel Inspection",
                    status: "APPROVED",
                    issuedDate: "2026-02-08",
                    issuingAuthority: "County Inspector - J. Martinez",
                    projectId: projectId!,
                    attachments: 1
                },
                {
                    id: "3",
                    recordNumber: "SAFE-2026-012",
                    category: "SAFETY",
                    title: "OSHA Safety Certification",
                    status: "APPROVED",
                    issuedDate: "2026-01-20",
                    expiryDate: "2026-07-20",
                    issuingAuthority: "OSHA Regional Office",
                    projectId: projectId!,
                    notes: "Next inspection scheduled for June 2026",
                    attachments: 5
                },
                {
                    id: "4",
                    recordNumber: "ENV-2026-003",
                    category: "ENVIRONMENTAL",
                    title: "Stormwater Pollution Prevention Plan",
                    status: "PENDING",
                    issuedDate: "2026-02-10",
                    issuingAuthority: "EPA Regional Office",
                    projectId: projectId!,
                    notes: "Awaiting final approval",
                    attachments: 2
                },
                {
                    id: "5",
                    recordNumber: "QUAL-2026-008",
                    category: "QUALITY",
                    title: "Concrete Testing Certificate",
                    status: "APPROVED",
                    issuedDate: "2026-02-05",
                    expiryDate: "2026-05-05",
                    issuingAuthority: "AccuTest Laboratories",
                    projectId: projectId!,
                    attachments: 1
                }
            ];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // Mock - in production would POST to API
            return { ...data, id: Date.now().toString() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-compliance", projectId] });
            toast({ title: "Compliance Record Created", description: "Record has been added to the tracker." });
            setIsCreateOpen(false);
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            recordNumber: formData.get("recordNumber"),
            category: formData.get("category"),
            title: formData.get("title"),
            issuedDate: formData.get("issuedDate"),
            expiryDate: formData.get("expiryDate") || undefined,
            issuingAuthority: formData.get("issuingAuthority"),
            notes: formData.get("notes"),
            projectId,
            status: "PENDING"
        });
    };

    const categoryConfig = {
        "PERMIT": { icon: FileText, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Permit" },
        "INSPECTION": { icon: CheckCircle2, color: "bg-green-100 text-green-800 border-green-200", label: "Inspection" },
        "SAFETY": { icon: AlertCircle, color: "bg-orange-100 text-orange-800 border-orange-200", label: "Safety" },
        "ENVIRONMENTAL": { icon: FileText, color: "bg-teal-100 text-teal-800 border-teal-200", label: "Environmental" },
        "QUALITY": { icon: Award, color: "bg-purple-100 text-purple-800 border-purple-200", label: "Quality" }
    };

    const statusConfig = {
        "PENDING": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
        "APPROVED": { color: "bg-green-100 text-green-800 border-green-200", label: "Approved" },
        "EXPIRED": { color: "bg-red-100 text-red-800 border-red-200", label: "Expired" },
        "REJECTED": { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Rejected" }
    };

    // Calculate summary stats
    const stats = {
        total: records.length,
        approved: records.filter(r => r.status === "APPROVED").length,
        pending: records.filter(r => r.status === "PENDING").length,
        expiringSoon: records.filter(r => {
            if (!r.expiryDate) return false;
            const daysUntilExpiry = Math.floor((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).length
    };

    const getExpiryStatus = (expiryDate?: string) => {
        if (!expiryDate) return null;
        const daysUntilExpiry = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) return { text: "Expired", color: "text-red-600 font-semibold" };
        if (daysUntilExpiry <= 30) return { text: `Expires in ${daysUntilExpiry} days`, color: "text-orange-600 font-semibold" };
        return { text: `Expires ${format(new Date(expiryDate), "MMM d, yyyy")}`, color: "text-muted-foreground" };
    };

    const handleExportPDF = async () => {
        try {
            await generateCompliancePDF({
                projectName: "Sample Construction Project",
                projectNumber: projectId || "PRJ-2026-001",
                reportDate: new Date().toISOString(),
                records: records.map(r => ({
                    ...r,
                    category: r.category as any
                })),
                companyName: "Construction Management System"
            });
            toast({ title: "PDF Generated", description: "Compliance report PDF downloaded successfully." });
        } catch (error) {
            toast({ title: "Export Failed", description: "Failed to generate PDF.", variant: "destructive" });
        }
    };

    if (!projectId) {
        return (
            <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                Select a project to manage compliance records
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground">Total Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-yellow-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-orange-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Expiring Soon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
                        <div className="text-xs text-muted-foreground">Within 30 days</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Compliance Records</h3>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleExportPDF}>
                        <FileText className="h-4 w-4 mr-1" />
                        Export PDF
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Record
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All ({records.length})</TabsTrigger>
                    <TabsTrigger value="permits">Permits ({records.filter(r => r.category === "PERMIT").length})</TabsTrigger>
                    <TabsTrigger value="inspections">Inspections ({records.filter(r => r.category === "INSPECTION").length})</TabsTrigger>
                    <TabsTrigger value="expiring">Expiring ({stats.expiringSoon})</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <StandardTable
                        data={records}
                        isLoading={isLoading}
                        columns={[
                            {
                                header: "Record #",
                                accessorKey: "recordNumber",
                                sortable: true,
                                cell: (item: ComplianceRecord) => (
                                    <span className="font-mono font-semibold text-sm">{item.recordNumber}</span>
                                )
                            },
                            {
                                header: "Category",
                                accessorKey: "category",
                                cell: (item: ComplianceRecord) => {
                                    const config = categoryConfig[item.category];
                                    const Icon = config.icon;
                                    return (
                                        <Badge variant="outline" className={config.color}>
                                            <Icon className="h-3 w-3 mr-1" />
                                            {config.label}
                                        </Badge>
                                    );
                                }
                            },
                            {
                                header: "Title",
                                accessorKey: "title",
                                cell: (item: ComplianceRecord) => (
                                    <div>
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-xs text-muted-foreground">{item.issuingAuthority}</div>
                                    </div>
                                )
                            },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: ComplianceRecord) => {
                                    const config = statusConfig[item.status];
                                    return (
                                        <Badge variant="outline" className={config.color}>
                                            {config.label}
                                        </Badge>
                                    );
                                }
                            },
                            {
                                header: "Issued",
                                accessorKey: "issuedDate",
                                sortable: true,
                                cell: (item: ComplianceRecord) => format(new Date(item.issuedDate), "MMM d, yyyy")
                            },
                            {
                                header: "Expiry Status",
                                accessorKey: "expiryDate",
                                cell: (item: ComplianceRecord) => {
                                    const status = getExpiryStatus(item.expiryDate);
                                    return status ? <span className={cn("text-sm", status.color)}>{status.text}</span> : <span className="text-sm text-muted-foreground">-</span>;
                                }
                            },
                            {
                                header: "",
                                accessorKey: "actions",
                                cell: (item: ComplianceRecord) => (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setSelectedRecord(item);
                                            setIsDetailOpen(true);
                                        }}
                                    >
                                        View
                                    </Button>
                                )
                            }
                        ]}
                    />
                </TabsContent>

                <TabsContent value="permits">
                    <StandardTable
                        data={records.filter(r => r.category === "PERMIT")}
                        isLoading={isLoading}
                        columns={[
                            { header: "Record #", accessorKey: "recordNumber", sortable: true },
                            { header: "Title", accessorKey: "title" },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: ComplianceRecord) => <Badge variant="outline" className={statusConfig[item.status].color}>{statusConfig[item.status].label}</Badge>
                            },
                            { header: "Issued", accessorKey: "issuedDate", cell: (item: ComplianceRecord) => format(new Date(item.issuedDate), "MMM d, yyyy") },
                            {
                                header: "Expiry",
                                accessorKey: "expiryDate",
                                cell: (item: ComplianceRecord) => {
                                    const status = getExpiryStatus(item.expiryDate);
                                    return status ? <span className={status.color}>{status.text}</span> : "-";
                                }
                            }
                        ]}
                    />
                </TabsContent>

                <TabsContent value="inspections">
                    <StandardTable
                        data={records.filter(r => r.category === "INSPECTION")}
                        isLoading={isLoading}
                        columns={[
                            { header: "Record #", accessorKey: "recordNumber", sortable: true },
                            { header: "Title", accessorKey: "title" },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: ComplianceRecord) => <Badge variant="outline" className={statusConfig[item.status].color}>{statusConfig[item.status].label}</Badge>
                            },
                            { header: "Inspector", accessorKey: "issuingAuthority" },
                            { header: "Date", accessorKey: "issuedDate", cell: (item: ComplianceRecord) => format(new Date(item.issuedDate), "MMM d, yyyy") }
                        ]}
                    />
                </TabsContent>

                <TabsContent value="expiring">
                    <StandardTable
                        data={records.filter(r => {
                            if (!r.expiryDate) return false;
                            const daysUntilExpiry = Math.floor((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                        })}
                        isLoading={isLoading}
                        columns={[
                            { header: "Record #", accessorKey: "recordNumber", sortable: true },
                            {
                                header: "Category",
                                accessorKey: "category",
                                cell: (item: ComplianceRecord) => {
                                    const config = categoryConfig[item.category];
                                    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
                                }
                            },
                            { header: "Title", accessorKey: "title" },
                            {
                                header: "Days Until Expiry",
                                accessorKey: "expiryDate",
                                sortable: true,
                                cell: (item: ComplianceRecord) => {
                                    const days = Math.floor((new Date(item.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return <span className="font-semibold text-orange-600">{days} days</span>;
                                }
                            }
                        ]}
                    />
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Compliance Record</DialogTitle>
                        <DialogDescription>Add a new permit, inspection, or certification record</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="recordNumber">Record Number *</Label>
                                <Input id="recordNumber" name="recordNumber" placeholder="e.g. PERMIT-2026-001" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select name="category" required>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERMIT">Permit</SelectItem>
                                        <SelectItem value="INSPECTION">Inspection</SelectItem>
                                        <SelectItem value="SAFETY">Safety</SelectItem>
                                        <SelectItem value="ENVIRONMENTAL">Environmental</SelectItem>
                                        <SelectItem value="QUALITY">Quality</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" name="title" placeholder="e.g. Building Permit - Foundation Work" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
                            <Input id="issuingAuthority" name="issuingAuthority" placeholder="e.g. City Building Department" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="issuedDate">Issued Date *</Label>
                                <DatePicker onChange={() => {}} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                                <DatePicker onChange={() => {}} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" name="notes" placeholder="Additional details..." />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Creating..." : "Create Record"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            {selectedRecord && (
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {selectedRecord.recordNumber}
                            </DialogTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className={categoryConfig[selectedRecord.category].color}>
                                    {categoryConfig[selectedRecord.category].label}
                                </Badge>
                                <Badge variant="outline" className={statusConfig[selectedRecord.status].color}>
                                    {statusConfig[selectedRecord.status].label}
                                </Badge>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Title</div>
                                <div className="font-medium">{selectedRecord.title}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Issuing Authority</div>
                                    <div>{selectedRecord.issuingAuthority}</div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Attachments</div>
                                    <div>{selectedRecord.attachments || 0} file(s)</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Issued Date
                                    </div>
                                    <div>{format(new Date(selectedRecord.issuedDate), "MMMM d, yyyy")}</div>
                                </div>

                                {selectedRecord.expiryDate && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Expiry Date
                                        </div>
                                        <div>{format(new Date(selectedRecord.expiryDate), "MMMM d, yyyy")}</div>
                                        <div className="text-xs mt-1">
                                            {getExpiryStatus(selectedRecord.expiryDate) && (
                                                <span role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} className={getExpiryStatus(selectedRecord.expiryDate)!.color}
                                                    onClick={() => trackComplianceExpiry("viewed", Math.floor((new Date(selectedRecord.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                                >
                                                    {getExpiryStatus(selectedRecord.expiryDate)!.text}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedRecord.notes && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                                    <div className="text-sm bg-muted p-3 rounded-lg">{selectedRecord.notes}</div>
                                </div>
                            )}

                            {/* Attachments Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Paperclip className="h-3 w-3" />
                                        Attached Documents
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setIsUploadOpen(true);
                                        trackDocumentAction("upload");
                                    }}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Upload
                                    </Button>
                                </div>
                                {selectedRecord.attachmentsList && selectedRecord.attachmentsList.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedRecord.attachmentsList.map(attachment => (
                                            <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium truncate">{attachment.filename}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {(attachment.fileSize / 1024).toFixed(2)} KB • {formatDate(attachment.uploadedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setViewerAttachment(attachment);
                                                            trackDocumentAction("preview", attachment.fileType);
                                                        }}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            window.location.href = attachment.url;
                                                            trackDocumentAction("download", attachment.fileType);
                                                        }}
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg text-center">
                                        No documents attached
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Document Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Upload Documents</DialogTitle>
                        <DialogDescription>
                            Upload compliance documents, permits, or certificates for {selectedRecord?.recordNumber}
                        </DialogDescription>
                    </DialogHeader>
                    <DocumentUpload
                        recordId={selectedRecord?.id}
                        onUploadComplete={(files) => {
                            queryClient.invalidateQueries({ queryKey: ["construction-compliance", projectId] });
                            setIsUploadOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Document Viewer */}
            <DocumentViewer
                attachment={viewerAttachment}
                isOpen={!!viewerAttachment}
                onClose={() => setViewerAttachment(null)}
            />
        </div>
    );
}
