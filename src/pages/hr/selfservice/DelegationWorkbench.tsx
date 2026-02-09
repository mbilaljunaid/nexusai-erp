import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { i18n } from "@/lib/i18n";
import {
    UserCheck,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    Shield,
    Users,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/ui/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface Delegation {
    id: string;
    proxyId: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    canApproveTransitions: boolean;
    canViewTeamAnalytics: boolean;
}

interface Employee {
    id: string;
    name: string;
    email: string;
}

export default function DelegationWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [selectedProxy, setSelectedProxy] = useState<Employee | null>(null);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [canApprove, setCanApprove] = useState(true);
    const [canView, setCanView] = useState(false);

    const { data: delegations, isLoading } = useQuery<Delegation[]>({
        queryKey: ["/api/hr-self-service/me/delegation"],
    });

    const { data: eligibleProxies } = useQuery<Employee[]>({
        queryKey: ["/api/hr-self-service/eligible-proxies"],
    });

    const addMutation = useMutation({
        mutationFn: async (newDelegation: any) => {
            const res = await fetch("/api/hr-self-service/me/delegation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDelegation),
            });
            if (!res.ok) throw new Error("Failed to add delegation");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr-self-service/me/delegation"] });
            toast({ title: "Success", description: "Delegation rule added." });
            setIsAddDialogOpen(false);
            resetForm();
        },
    });

    const revokeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/hr-self-service/me/delegation/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to revoke delegation");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr-self-service/me/delegation"] });
            toast({ title: "Revoked", description: "Delegation rule has been deactivated." });
        },
    });

    const resetForm = () => {
        setSelectedProxy(null);
        setStartDate(new Date());
        setEndDate(undefined);
        setCanApprove(true);
        setCanView(false);
    };

    const handleAdd = () => {
        if (!selectedProxy) {
            toast({ variant: "destructive", title: "Wait", description: "Please select a proxy." });
            return;
        }
        addMutation.mutate({
            proxyId: selectedProxy.id,
            startDate,
            endDate,
            canApproveTransitions: canApprove,
            canViewTeamAnalytics: canView,
        });
    };

    const columns: Column<Delegation>[] = [
        {
            key: "proxyId",
            header: "Proxy Name",
            render: (val: any) => {
                const emp = eligibleProxies?.find(e => e.id === val);
                return emp ? emp.name : val;
            }
        },
        {
            key: "startDate",
            header: "Start Date",
            render: (val: any) => format(new Date(val), "PPP")
        },
        {
            key: "endDate",
            header: "End Date",
            render: (val: any) => val ? format(new Date(val), "PPP") : "No End Date"
        },
        {
            key: "canApproveTransitions",
            header: "Approve Authority",
            render: (val: any) => (
                <div className="flex items-center gap-2">
                    <Shield className={val ? "text-green-500 w-4 h-4" : "text-gray-300 w-4 h-4"} />
                    <span className="text-xs">{val ? "Yes" : "No"}</span>
                </div>
            )
        },
        {
            key: "canViewTeamAnalytics",
            header: "Analytics View",
            render: (val: any) => (
                <div className="flex items-center gap-2">
                    <Users className={val ? "text-blue-500 w-4 h-4" : "text-gray-300 w-4 h-4"} />
                    <span className="text-xs">{val ? "Yes" : "No"}</span>
                </div>
            )
        },
        {
            key: "id",
            header: "Actions",
            render: (id: any) => (
                <Button variant="ghost" size="sm" onClick={() => revokeMutation.mutate(id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Delegation Workbench"
            subtitle="Manage your approval and analytics proxies"
            icon={<UserCheck className="w-8 h-8 text-primary" />}
        >
            <div className="grid gap-6">
                <Card className="vanguard-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Active Delegations</CardTitle>
                            <CardDescription>Managers currently authorized to act on your behalf</CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="vanguard-button">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Proxy
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Add Delegate Authority</DialogTitle>
                                    <DialogDescription>
                                        Select a colleague and specify their permissions and duration.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid gap-2">
                                        <Label>Select Proxy</Label>
                                        <Command className="rounded-lg border shadow-md">
                                            <CommandInput placeholder="Search employee..." />
                                            <CommandList>
                                                <CommandEmpty>No employee found.</CommandEmpty>
                                                <CommandGroup>
                                                    {eligibleProxies?.map((emp) => (
                                                        <CommandItem
                                                            key={emp.id}
                                                            onSelect={() => setSelectedProxy(emp)}
                                                            className={selectedProxy?.id === emp.id ? "bg-accent" : ""}
                                                        >
                                                            {emp.name} ({emp.email})
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        {selectedProxy && (
                                            <p className="text-sm text-primary font-medium mt-1">
                                                Selected: {selectedProxy.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="grid gap-2 flex-1">
                                            <Label>Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={startDate} onSelect={(d: Date | undefined) => d && setStartDate(d)} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label>End Date (Optional)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <Label>Approve Transitions</Label>
                                                <p className="text-xs text-muted-foreground">Proxy can approve leave and workflows on your behalf.</p>
                                            </div>
                                            <Switch checked={canApprove} onCheckedChange={setCanApprove} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <Label>View Team Analytics</Label>
                                                <p className="text-xs text-muted-foreground">Proxy can see team performance and attrition risk.</p>
                                            </div>
                                            <Switch checked={canView} onCheckedChange={setCanView} />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAdd} disabled={addMutation.isPending}>
                                        {addMutation.isPending ? "Adding..." : "Confirm Delegation"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            data={delegations || []}
                            columns={columns}
                            isLoading={isLoading}
                        />
                        {delegations?.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                                <p>No active delegations found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
