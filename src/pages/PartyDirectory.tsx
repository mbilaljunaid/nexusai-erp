
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Search, Building2, User, Eye, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Party {
    id: string;
    partyName: string;
    partyNumber: string;
    partyType: "ORGANIZATION" | "PERSON";
    email: string | null;
    status: string;
    createdAt: string;
}

export default function PartyDirectory() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [location, setLocation] = useLocation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Basic Search Party fetch
    const { data: parties = [], isLoading } = useQuery<Party[]>({
        queryKey: ["/api/mdm/parties"],
    });

    // Create Mutation
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const endpoint = data.partyType === "ORGANIZATION"
                ? "/api/mdm/parties/organization"
                : "/api/mdm/parties/person";

            const payload = {
                party: {
                    partyName: data.name,
                    email: data.email,
                    primaryPhone: data.phone,
                    status: "A"
                },
                profile: data.partyType === "ORGANIZATION"
                    ? { dunsNumber: data.idNumber }
                    : { firstName: data.name.split(" ")[0], lastName: data.name.split(" ")[1] || "" }
            };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to create party");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/parties"] });
            setIsSheetOpen(false);
            toast({ title: "Success", description: "Party created successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create party", variant: "destructive" });
        }
    });

    const columns = [
        {
            id: "partyName",
            header: "Party Name",
            width: "250px",
            cell: (row: Party) => (
                <div className="px-2 h-full flex items-center gap-2">
                    {row.partyType === "ORGANIZATION" ? <Building2 className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4 text-green-500" />}
                    <span className="font-medium">{row.partyName}</span>
                </div>
            )
        },
        { id: "partyNumber", header: "Registry ID", width: "150px", cell: (row: Party) => <div className="px-2 h-full flex items-center">{row.partyNumber}</div> },
        { id: "partyType", header: "Type", width: "150px", cell: (row: Party) => <div className="px-2 h-full flex items-center"><Badge variant="outline">{row.partyType}</Badge></div> },
        { id: "email", header: "Email", width: "200px", cell: (row: Party) => <div className="px-2 h-full flex items-center">{row.email || "-"}</div> },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: Party) => <div className="px-2 h-full flex items-center"><Badge variant={row.status === "A" ? "default" : "secondary"}>{row.status === "A" ? "Active" : "Inactive"}</Badge></div>
        },
        {
            id: "actions",
            header: "Actions",
            width: "150px",
            cell: (row: Party) => (
                <div className="px-2 h-full flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => setLocation(`/mdm/parties/${row.id}`)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                </div>
            )
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get("name") as string,
            partyType: formData.get("partyType") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            idNumber: formData.get("idNumber") as string
        };
        mutation.mutate(data);
    };

    return (
        <StandardPage
            title="Master Data Registry"
            description="Centralized registry for all Organizations and People (TCA)"
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Registry" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setLocation("/mdm/import")}>
                            <Upload className="mr-2 h-4 w-4" /> Bulk Import
                        </Button>
                        <SheetTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Record
                            </Button>
                        </SheetTrigger>
                    </div>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create New Party</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="partyType">Party Type</Label>
                                <Select name="partyType" defaultValue="ORGANIZATION">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ORGANIZATION">Organization</SelectItem>
                                        <SelectItem value="PERSON">Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="Company or Full Name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="idNumber">Registry ID / DUNS</Label>
                                <Input id="idNumber" name="idNumber" placeholder="Optional" />
                            </div>
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? "Creating..." : "Create Record"}
                            </Button>
                        </form>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="bg-card w-full rounded-md border shadow-sm">
                <InteractiveSpreadsheet
                    data={parties}
                    columns={columns}
                    onChange={() => { }}
                    virtualized={true}
                    containerHeight="600px"
                />
            </div>
        </StandardPage>
    );
}
