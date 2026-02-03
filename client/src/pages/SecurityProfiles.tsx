import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Lock,
    Plus,
    Search,
    UserCheck,
    Building2,
    MapPin,
    ShieldAlert,
    Trash2,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/standardtable";
import { MetricCard } from "@/components/MetricCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface HrAor {
    id: string;
    personId: string;
    scopeType: string;
    scopeValueId: string;
    responsibilityType: string;
    isActive: boolean;
    createdAt: string;
    // Joins
    personName?: string;
    scopeValueName?: string;
}

export default function SecurityProfiles() {
    const { toast } = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [newAor, setNewAor] = useState({
        personId: "",
        scopeType: "DEPARTMENT",
        scopeValueId: "",
        responsibilityType: "HR_REP",
    });

    // Queries
    const { data: aors = [], isLoading } = useQuery<HrAor[]>({
        queryKey: ["/api/hr/security/aor"],
        queryFn: () => fetch("/api/hr/security/aor").then((r) => r.json()),
    });

    const { data: persons = [] } = useQuery<any[]>({
        queryKey: ["/api/hr/persons"],
        queryFn: () => fetch("/api/hr/persons").then((r) => r.json().then(d => d.data)),
    });

    const { data: orgs = [] } = useQuery<any[]>({
        queryKey: ["/api/hr/structures/organizations"],
        queryFn: () => fetch("/api/hr/structures/organizations").then((r) => r.json()),
    });

    const { data: locations = [] } = useQuery<any[]>({
        queryKey: ["/api/hr/structures/locations"],
        queryFn: () => fetch("/api/hr/structures/locations").then((r) => r.json()),
    });

    // Identifiers for lookup
    const getPersonName = (id: string) => {
        const p = persons.find(p => p.id === id);
        return p ? `${p.firstName} ${p.lastName}` : id;
    };

    const getScopeValueName = (type: string, id: string) => {
        if (type === "DEPARTMENT" || type === "LEGAL_EMPLOYER") {
            return orgs.find(o => o.id === id)?.name || id;
        }
        if (type === "LOCATION") {
            return locations.find(l => l.id === id)?.name || id;
        }
        return id;
    };

    const assignMutation = useMutation({
        mutationFn: (data: typeof newAor) =>
            fetch("/api/hr/security/aor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((r) => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/security/aor"] });
            setIsSheetOpen(false);
            setNewAor({
                personId: "",
                scopeType: "DEPARTMENT",
                scopeValueId: "",
                responsibilityType: "HR_REP",
            });
            toast({
                title: "Security Profile Assigned",
                description: "The Area of Responsibility has been successfully mapped.",
            });
        },
    });

    const columns: Column<HrAor>[] = [
        {
            header: "Representative",
            accessorKey: "personId",
            cell: (a) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{getPersonName(a.personId)}</span>
                    <span className="text-xs text-muted-foreground font-mono">{a.personId.substring(0, 8)}</span>
                </div>
            ),
        },
        {
            header: "Responsibility",
            accessorKey: "responsibilityType",
            cell: (a) => (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 uppercase text-[10px]">
                    {a.responsibilityType.replace("_", " ")}
                </Badge>
            ),
        },
        {
            header: "Scope Type",
            accessorKey: "scopeType",
            cell: (a) => (
                <div className="flex items-center gap-1.5">
                    {a.scopeType === "DEPARTMENT" && <Building2 className="h-3.5 w-3.5 text-blue-500" />}
                    {a.scopeType === "LOCATION" && <MapPin className="h-3.5 w-3.5 text-orange-500" />}
                    {a.scopeType === "LEGAL_EMPLOYER" && <ShieldAlert className="h-3.5 w-3.5 text-purple-500" />}
                    <span className="text-xs font-semibold text-slate-600 uppercase">{a.scopeType.replace("_", " ")}</span>
                </div>
            ),
        },
        {
            header: "Scope Value",
            accessorKey: "scopeValueId",
            cell: (a) => (
                <span className="text-sm font-medium text-slate-700">
                    {getScopeValueName(a.scopeType, a.scopeValueId)}
                </span>
            ),
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (a) => (
                <Badge className={a.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                    {a.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
            ),
        },
    ];

    const scopeOptions =
        newAor.scopeType === "LOCATION"
            ? locations.map((l) => ({ value: l.id, label: l.name }))
            : orgs
                .filter((o) => (newAor.scopeType === "LEGAL_EMPLOYER" ? o.type === "LE" : o.type === "DEPT" || !o.type))
                .map((o) => ({ value: o.id, label: o.name }));

    return (
        <div className="space-y-6 container mx-auto">
            <div>
                <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Security & Governance", path: "/compliance/dashboard" }, { label: "Security Profiles", path: "/compliance/security" }]} />
                <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2 text-slate-900 font-display">
                    <Lock className="h-8 w-8 text-indigo-600" />
                    Security Profiles (AOR)
                </h1>
                <p className="text-muted-foreground mt-1 text-sm max-w-2xl leading-relaxed">
                    Manage Areas of Responsibility (AOR) for HR personnel to restrict data access and compliance visibility
                    based on organizational, geographic, or legal dimensions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="Active Profiles"
                    value={aors.length}
                    icon={UserCheck}
                    iconColor="text-indigo-500"
                />
                <MetricCard
                    title="Scope Coverage"
                    value={Array.from(new Set(aors.map(a => a.scopeValueId))).length}
                    icon={Building2}
                    iconColor="text-blue-500"
                />
                <MetricCard
                    title="Security Representatives"
                    value={Array.from(new Set(aors.map(a => a.personId))).length}
                    icon={ShieldAlert}
                    iconColor="text-purple-500"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-slate-400" />
                        <h3 className="font-bold text-slate-800 italic">Security Assignment Ledger</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search profiles..."
                                className="pl-9 h-9 w-[260px] bg-white border-slate-200 rounded-lg"
                            />
                        </div>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" className="h-9 gap-2 shadow-md bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="h-4 w-4" />
                                    Assign Responsibility
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="sm:max-w-md border-l-0 shadow-2xl">
                                <SheetHeader className="pb-6 border-b">
                                    <SheetTitle className="text-2xl font-bold text-slate-900">Assign Security Profile</SheetTitle>
                                </SheetHeader>
                                <div className="py-8 space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="person" className="text-sm font-bold text-slate-700">Select Manager/Rep</Label>
                                        <Select
                                            value={newAor.personId}
                                            onValueChange={(val) => setNewAor({ ...newAor, personId: val })}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-indigo-500">
                                                <SelectValue placeholder="Search Person..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {persons.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.firstName} {p.lastName} ({p.personNumber})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700">Responsibility Type</Label>
                                            <Select
                                                value={newAor.responsibilityType}
                                                onValueChange={(val) => setNewAor({ ...newAor, responsibilityType: val })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="HR_REP">HR Representative</SelectItem>
                                                    <SelectItem value="PAYROLL_REP">Payroll Representative</SelectItem>
                                                    <SelectItem value="BENEFITS_REP">Benefits Representative</SelectItem>
                                                    <SelectItem value="COMPLIANCE_REP">Compliance Representative</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700">Scope Type</Label>
                                            <Select
                                                value={newAor.scopeType}
                                                onValueChange={(val) => setNewAor({ ...newAor, scopeType: val, scopeValueId: "" })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DEPARTMENT">Department</SelectItem>
                                                    <SelectItem value="LOCATION">Location</SelectItem>
                                                    <SelectItem value="LEGAL_EMPLOYER">Legal Employer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700">Scope Value</Label>
                                        <Select
                                            value={newAor.scopeValueId}
                                            onValueChange={(val) => setNewAor({ ...newAor, scopeValueId: val })}
                                            disabled={!newAor.scopeType}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                <SelectValue placeholder={`Select ${newAor.scopeType.toLowerCase()}...`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {scopeOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <SheetFooter className="pt-6 border-t mt-auto">
                                    <Button
                                        className="w-full h-11 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                                        onClick={() => assignMutation.mutate(newAor)}
                                        disabled={!newAor.personId || !newAor.scopeValueId || assignMutation.isPending}
                                    >
                                        {assignMutation.isPending ? "Assigning..." : "Activate Security Profile"}
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
                <StandardTable
                    data={aors}
                    columns={columns}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
