import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Added missing import
import { Briefcase, User, MapPin, Building, Calendar, FileText, CheckSquare, Plus, Shield } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { TransferWorkerDialog } from "./TransferWorkerDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EmploymentProfileProps {
    personId: string;
}

export function EmploymentProfile({ personId }: EmploymentProfileProps) {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["hr-person-profile", personId],
        queryFn: () => api.hr.persons.get(personId),
        enabled: !!personId,
    });

    if (isLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>;
    }

    if (!profile || !profile.person) {
        return <div>Person not found</div>;
    }

    const { person, assignments, relationships } = profile;
    const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const relationship = relationships?.[0]; // Default for now, robust solution would filter workRel too

    // Filter logic for Effective Dating
    // Find assignment that is active on effectiveDate
    // StartDate <= EffectiveDate AND (EndDate IS NULL OR EndDate >= EffectiveDate)
    const activeAssignment = assignments?.find((a: any) => {
        const start = new Date(a.effectiveStartDate);
        const end = a.effectiveEndDate ? new Date(a.effectiveEndDate) : null;
        return start <= effectiveDate && (!end || end >= effectiveDate);
    });

    // Fallback to latest if nothing active (e.g. future hire viewed in past)
    // or just show empty state? Oracle shows "No active assignment on this date".
    const displayAssignment = activeAssignment || assignments?.[0];

    return (
        <div className="space-y-6">
            {/* Header / Banner */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{person.lastName}, {person.firstName}</h2>
                    <div className="flex gap-2 items-center text-muted-foreground mt-1">
                        <Badge variant="outline">{person.personNumber}</Badge>
                        <span className="text-sm">{person.email}</span>
                        {person.nationalId && (
                            person.nationalId.includes('*') ? (
                                <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <Shield className="h-3 w-3" /> Confidential
                                </Badge>
                            ) : (
                                <span className="text-sm">• NID: ***{person.nationalId.slice(-4)}</span>
                            )
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">As Of Date:</span>
                        <Input
                            type="date"
                            className="w-40"
                            value={format(effectiveDate, "yyyy-MM-dd")}
                            onChange={(e) => setEffectiveDate(new Date(e.target.value))}
                        />
                    </div>
                    <Badge variant={displayAssignment?.assignmentStatus === "ACTIVE" ? "default" : "destructive"}>
                        {displayAssignment?.assignmentStatus || "INACTIVE"}
                    </Badge>
                </div>
            </div>

            {/* Effective Date Warning Banner */}
            {format(effectiveDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd") && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded text-sm mb-4">
                    <p className="font-bold">Viewing History / Simulation</p>
                    <p>You are viewing the record as of <b>{format(effectiveDate, "PP")}</b>. Changes made here will be effective from this date.</p>
                </div>
            )}

            <Tabs defaultValue="employment" className="w-full">
                <TabsList>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="compliance">Checklists</TabsTrigger>
                </TabsList>

                <TabsContent value="employment" className="space-y-4 mt-4">
                    {/* Current Assignment Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" /> Assignment Details
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)}>
                                    Update / Transfer
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Job</label>
                                <p className="text-base font-medium">{displayAssignment?.jobId || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Department</label>
                                <p className="text-base font-medium">{displayAssignment?.departmentId || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Legal Employer</label>
                                <p className="text-base font-medium">{relationship?.legalEmployerId || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Worker Type</label>
                                <p className="text-base font-medium">{relationship?.workerType}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Effective Start Date</label>
                                <p className="text-base font-medium">
                                    {displayAssignment?.effectiveStartDate ? format(new Date(displayAssignment.effectiveStartDate), "PP") : "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                <p className="text-base font-medium">{displayAssignment?.locationId || "Remote"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manager Chain Placeholder */}
                    <ManagerChain managerId={displayAssignment?.managerId} />
                </TabsContent>

                <TabsContent value="personal">
                    <Card>
                        <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                                    <p>
                                        {person.dateOfBirth === '1900-01-01' ? (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground italic">
                                                <Shield className="h-3 w-3" /> Redacted
                                            </span>
                                        ) : (
                                            person.dateOfBirth ? format(new Date(person.dateOfBirth), "PP") : "N/A"
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Phone</label>
                                    <p>{person.phone || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <DocumentList personId={personId} />
                </TabsContent>

                <TabsContent value="compliance">
                    <ComplianceList personId={personId} />
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment History</CardTitle>
                            <CardDescription>Timeline of changes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {assignments?.sort((a: any, b: any) => new Date(b.effectiveStartDate).getTime() - new Date(a.effectiveStartDate).getTime()).map((asg: any) => (
                                    <div key={asg.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="font-medium">{asg.jobId || "No Job"} - {asg.departmentId || "No Dept"}</p>
                                            <p className="text-sm text-muted-foreground">{asg.assignmentNumber} • {asg.assignmentStatus}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="font-medium text-primary">
                                                {format(new Date(asg.effectiveStartDate), "PP")}
                                                {asg.effectiveEndDate ? ` - ${format(new Date(asg.effectiveEndDate), "PP")}` : " - Present"}
                                            </p>
                                            <p className="text-muted-foreground">{asg.changeReason || "Original Hire"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Updated by: {asg.updatedBy || asg.createdBy || "System"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <TransferWorkerDialog
                personId={personId}
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
            />
        </div >
    );
}

function ManagerChain({ managerId }: { managerId?: string | null }) {
    const { data: managerProfile, isLoading } = useQuery({
        queryKey: ["hr-person-profile", managerId],
        queryFn: () => api.hr.persons.get(managerId!),
        enabled: !!managerId,
    });

    if (!managerId) {
        return (
            <Card>
                <CardHeader><CardTitle>Management Chain</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No Line Manager assigned.</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

    const manager = managerProfile?.person;

    return (
        <Card>
            <CardHeader><CardTitle>Management Chain</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                        <p className="font-medium text-lg">{manager?.lastName}, {manager?.firstName}</p>
                        <p className="text-sm text-muted-foreground">{manager?.email}</p>
                        <Badge variant="secondary" className="mt-1">Line Manager</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DocumentList({ personId }: { personId: string }) {
    const { data: documents, refetch } = useQuery({
        queryKey: ["hr-documents", personId],
        queryFn: () => api.hr.documents.list(personId),
    });

    const [isOpen, setIsOpen] = useState(false);

    // Form state (simple)
    const [docType, setDocType] = useState("PASSPORT");
    const [docName, setDocName] = useState("");
    const [docNum, setDocNum] = useState("");

    const handleAdd = async () => {
        await api.hr.documents.create({
            personId,
            documentType: docType,
            tenantId: "t1", // Hardcoded for prototype
            documentName: docName,
            documentNumber: docNum,
            issuingAuthority: "Authority",
        });
        setIsOpen(false);
        refetch();
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Worker Documents</CardTitle>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={docType} onValueChange={setDocType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PASSPORT">Passport</SelectItem>
                                            <SelectItem value="VISA">Visa</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. US Passport" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Number</Label>
                                    <Input value={docNum} onChange={e => setDocNum(e.target.value)} placeholder="Doc #" />
                                </div>
                                <Button onClick={handleAdd} className="w-full">Save Record</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {documents?.length === 0 ? <p className="text-muted-foreground">No records found.</p> : (
                    <div className="space-y-4">
                        {documents?.map((doc: any) => (
                            <div key={doc.id} className="flex justify-between items-center border p-3 rounded-md">
                                <div className="flex gap-3 items-center">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{doc.documentName}</p>
                                        <p className="text-xs text-muted-foreground">{doc.documentType} • {doc.documentNumber}</p>
                                    </div>
                                </div>
                                <Badge variant={doc.verificationStatus === 'VERIFIED' ? "default" : "secondary"}>
                                    {doc.verificationStatus}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ComplianceList({ personId }: { personId: string }) {
    const { data: allocations, refetch } = useQuery({
        queryKey: ["hr-checklists", personId],
        queryFn: () => api.hr.checklists.listAllocations(personId),
    });

    const assignChecklist = async () => {
        // hardcode assigning the first template for demo
        const templates = await api.hr.checklists.listTemplates();
        if (templates.length > 0) {
            await api.hr.checklists.assign({ personId, checklistId: templates[0].id, tenantId: "t1" }); // Added tenantId
            refetch();
        } else {
            alert("No Checklist Templates found. Create one in DB first.");
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Assigned Checklists</CardTitle>
                        <Button size="sm" variant="outline" onClick={assignChecklist}>Assign Onboarding</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {allocations?.length === 0 ? <p className="text-muted-foreground">No active checklists.</p> : (
                        allocations?.map((a: any) => (
                            <AllocatedChecklist key={a.allocation.id} allocation={a} />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AllocatedChecklist({ allocation }: { allocation: any }) {
    const { id } = allocation.allocation;
    const { name } = allocation.template || {};

    const { data: tasks, refetch } = useQuery({
        queryKey: ["hr-tasks", id],
        queryFn: () => api.hr.checklists.getTasks(id),
    });

    const toggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'DONE' ? 'PENDING' : 'DONE';
        await api.hr.checklists.updateTask(taskId, newStatus);
        refetch();
    }

    return (
        <div className="border rounded-lg p-4 mb-4">
            <div className="mb-4">
                <h4 className="font-semibold text-lg">{name || "Checklist"}</h4>
                <p className="text-sm text-muted-foreground">Status: {allocation.allocation.status}</p>
            </div>
            <div className="space-y-2">
                {tasks?.map((task: any) => (
                    <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={task.id}
                            checked={task.status === 'DONE'}
                            onCheckedChange={() => toggleTask(task.id, task.status)}
                        />
                        <label
                            htmlFor={task.id}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}
                        >
                            {task.taskName}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}
