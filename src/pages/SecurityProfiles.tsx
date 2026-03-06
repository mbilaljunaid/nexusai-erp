import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Lock, Shield, MapPin, Building2, Briefcase, Plus, User } from "lucide-react";

interface Aor {
    id: string;
    personId: string;
    name: string; // The "Role" name, e.g. HR Manager
    scopeType: 'DEPARTMENT' | 'LOCATION' | 'LEGAL_EMPLOYER';
    scopeValueId: string;
    isActive: boolean;
}

interface Organization {
    id: string;
    name: string;
    classificationCode: string;
}

interface Location {
    id: string;
    name: string;
    townOrCity: string;
}

export default function SecurityProfiles() {
    const { toast } = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [newAor, setNewAor] = useState({
        personId: "",
        name: "",
        scopeType: "DEPARTMENT",
        scopeValueId: ""
    });

    const { data: aors = [], isLoading } = useQuery<Aor[]>({
        queryKey: ["/api/hr/security/aor"],
        queryFn: () => fetch("/api/hr/security/aor").then(r => r.json())
    });

    // Lookup Data
    const { data: organizations = [] } = useQuery<Organization[]>({
        queryKey: ["/api/hr/structures/organizations"],
        queryFn: () => fetch("/api/hr/structures/organizations").then(r => r.json()),
        enabled: newAor.scopeType === 'DEPARTMENT' || newAor.scopeType === 'LEGAL_EMPLOYER'
    });

    const { data: locations = [] } = useQuery<Location[]>({
        queryKey: ["/api/hr/structures/locations"],
        queryFn: () => fetch("/api/hr/structures/locations").then(r => r.json()),
        enabled: newAor.scopeType === 'LOCATION'
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof newAor) => fetch("/api/hr/security/aor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, isActive: true })
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/security/aor"] });
            setIsSheetOpen(false);
            setNewAor({ personId: "", name: "", scopeType: "DEPARTMENT", scopeValueId: "" });
            toast({ title: "Security Profile Created", description: "Access rules have been updated for the user." });
        }
    });

    const getScopeOptions = () => {
        if (newAor.scopeType === 'LOCATION') {
            return locations.map(l => ({ id: l.id, name: l.name }));
        }
        // Filter orgs based on classification if needed, but for now show all to keep it simple or filter in memory
        return organizations.map(o => ({ id: o.id, name: o.name }));
    };

    const columns = [
        {
            id: "name",
            header: "Role / Profile Name",
            cell: (r: any) => (
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-md">
                        <Shield className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold">{r.name}</span>
                </div>
            )
        },
        {
            id: "personId",
            header: "Assigned User ID",
            cell: (r: any) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-mono text-xs">{r.personId}</span>
                </div>
            )
        },
        {
            id: "scopeType",
            header: "Scope Type",
            cell: (r: any) => {
                const icon = r.scopeType === 'LOCATION' ? MapPin : r.scopeType === 'DEPARTMENT' ? Building2 : Briefcase;
                const IconComp = icon;
                return (
                    <Badge variant="outline" className="gap-1 pl-1 pr-2">
                        <IconComp className="h-3 w-3" />
                        {r.scopeType.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            id: "coverage",
            header: "Coverage",
            cell: (r: any) => (
                <div className="flex items-center gap-1">
                    <span className="font-bold">{r.coverageCount || 0}</span>
                    <span className="text-muted-foreground text-xs">People</span>
                </div>
            )
        },
        {
            id: "scopeValueId",
            header: "Scope Value ID",
            cell: (r: any) => <span className="font-mono text-xs text-slate-500">{r.scopeValueId}</span>
        },
        {
            id: "isActive",
            header: "Status",
            cell: (r: any) => (
                <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} />
            )
        }
    ];

    return (
        <StandardPage
            title="SecurityProfiles"
            description=""
            className="space-y-6 container mx-auto py-6"
        >
            <div>
                <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Compliance", path: "/compliance/dashboard" }, { label: "Security Profiles", path: "/compliance/security" }]} />
                <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
                    <Lock className="h-8 w-8 text-indigo-600" />
                    Data Security Profiles
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage Area of Responsibility (AOR) access controls. These profiles determine which records users can view and edit based on legislation, department, or location.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Profiles</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{aors.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Department Scopes</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{aors.filter(a => a.scopeType === 'DEPARTMENT').length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Global Admins</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">--</div></CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-lg">Access Assignments</h2>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="gap-2 shadow-sm">
                                <Plus className="h-4 w-4" />
                                Assign Profile
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Assign Security Profile</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-6 py-6">
                                <div className="space-y-2">
                                    <Label>User (Person ID)</Label>
                                    <Input
                                        placeholder="e.g. 550e8400..."
                                        value={newAor.personId}
                                        onChange={e => setNewAor({ ...newAor, personId: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">ID of the user receiving access permissions.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Role Name</Label>
                                    <Input
                                        placeholder="e.g. Regional HR Director"
                                        value={newAor.name}
                                        onChange={e => setNewAor({ ...newAor, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Scope Type</Label>
                                    <Select
                                        value={newAor.scopeType}
                                        onValueChange={(val: any) => setNewAor({ ...newAor, scopeType: val, scopeValueId: "" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DEPARTMENT">Department</SelectItem>
                                            <SelectItem value="LOCATION">Location</SelectItem>
                                            <SelectItem value="LEGAL_EMPLOYER">Legal Employer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Scope Value</Label>
                                    <Select
                                        value={newAor.scopeValueId}
                                        onValueChange={(val) => setNewAor({ ...newAor, scopeValueId: val })}
                                        disabled={!newAor.scopeType}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scope..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getScopeOptions().map(opt => (
                                                <SelectItem key={opt.id} value={opt.id}>
                                                    {opt.name}
                                                </SelectItem>
                                            ))}
                                            {getScopeOptions().length === 0 && (
                                                <div className="p-2 text-xs text-center text-muted-foreground">No items found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <SheetFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => createMutation.mutate(newAor)}
                                    disabled={!newAor.personId || !newAor.name || !newAor.scopeValueId}
                                >
                                    Confirm Assignment
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="h-[500px]">
                    <InteractiveSpreadsheet
                        data={aors}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="500px"
                    />
                </div>
            </Card>
        </StandardPage>
    );
}
