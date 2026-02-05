import { useQuery } from "@tanstack/react-query";
import { StandardTable } from "@/components/ui/StandardTable";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "wouter";

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    phone?: string;
}

interface Opportunity {
    id: string;
    name: string;
    stage: string;
    amount: string;
    closeDate?: string;
}

interface Case {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
}

interface Asset {
    id: string;
    assetNumber: string;
    description: string;
    status: string;
    serialNumber?: string;
    model?: string;
}

// --- Contact List ---
export function AccountContactList({ accountId }: { accountId: string }) {
    const { data: contactsData, isLoading } = useQuery({
        queryKey: ["/api/crm/contacts", `accountId=${accountId}`],
        queryFn: () => fetch(`/api/crm/contacts?accountId=${accountId}`).then(res => res.json())
    });

    const contacts = (contactsData?.data || []) as Contact[];

    if (isLoading) return <div className="p-4 text-center">Loading contacts...</div>;

    return (
        <StandardTable
            data={contacts}
            columns={[
                { header: "Name", accessorKey: "firstName", cell: (c: Contact) => <span className="font-medium">{c.firstName} {c.lastName}</span> },
                { header: "Email", accessorKey: "email" },
                { header: "Role", accessorKey: "role", cell: (c: Contact) => <Badge variant="outline">{c.role || 'Contact'}</Badge> },
                { header: "Phone", accessorKey: "phone" }
            ]}
            keyExtractor={(c: Contact) => c.id}
        />
    );
}

// --- Opportunity List ---
export function AccountOpportunityList({ accountId }: { accountId: string }) {
    const { data: oppsData, isLoading } = useQuery({
        queryKey: ["/api/crm/opportunities", `accountId=${accountId}`],
        queryFn: () => fetch(`/api/crm/opportunities?accountId=${accountId}`).then(res => res.json())
    });

    const opportunities = (oppsData?.data || []) as Opportunity[];

    if (isLoading) return <div className="p-4 text-center">Loading opportunities...</div>;

    return (
        <StandardTable
            data={opportunities}
            columns={[
                { header: "Name", accessorKey: "name", cell: (o: Opportunity) => <span className="font-medium">{o.name}</span> },
                { header: "Stage", accessorKey: "stage", cell: (o: Opportunity) => <Badge variant="secondary">{o.stage.replace('_', ' ')}</Badge> },
                { header: "Amount", accessorKey: "amount", cell: (o: Opportunity) => `$${Number(o.amount).toLocaleString()}` },
                { header: "Close Date", accessorKey: "closeDate", cell: (o: Opportunity) => o.closeDate ? format(new Date(o.closeDate), 'PP') : '-' },
                {
                    header: "Actions",
                    accessorKey: "id",
                    cell: (o: Opportunity) => (
                        <Link href={`/crm/opportunities?id=${o.id}`}>
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                    )
                }
            ]}
            keyExtractor={(o: Opportunity) => o.id}
        />
    );
}

// --- Case List ---
export function AccountCaseList({ accountId }: { accountId: string }) {
    const { data: cases, isLoading } = useQuery({
        queryKey: ["/api/crm/cases", `accountId=${accountId}`],
        queryFn: () => fetch(`/api/crm/cases?accountId=${accountId}`).then(res => res.json())
    });

    const caseList = (cases || []) as Case[];

    if (isLoading) return <div className="p-4 text-center">Loading cases...</div>;

    return (
        <StandardTable
            data={caseList}
            columns={[
                { header: "Title", accessorKey: "title", cell: (c: Case) => <span className="font-medium">{c.title}</span> },
                { header: "Status", accessorKey: "status", cell: (c: Case) => <Badge className={c.status === 'open' ? 'bg-green-500' : 'bg-gray-500'}>{c.status}</Badge> },
                { header: "Priority", accessorKey: "priority", cell: (c: Case) => <Badge variant="outline">{c.priority}</Badge> },
                { header: "Created", accessorKey: "createdAt", cell: (c: Case) => format(new Date(c.createdAt), 'PP') }
            ]}
            keyExtractor={(c: Case) => c.id}
        />
    );
}

// --- Asset List ---
export function AccountAssetList({ accountId }: { accountId: string }) {
    const { data: assets, isLoading } = useQuery({
        queryKey: ["/api/assets", `accountId=${accountId}`],
        queryFn: async () => {
            try {
                // Supports the new filter added to maintenance/routes.ts
                const res = await fetch(`/api/assets?accountId=${accountId}`);
                if (!res.ok) return [];
                const data = await res.json();
                return Array.isArray(data) ? data : (data.data || []);
            } catch (e) {
                return [];
            }
        }
    });

    const assetList = (assets || []) as Asset[];

    if (isLoading) return <div className="p-4 text-center">Loading assets...</div>;

    return (
        <StandardTable
            data={assetList}
            columns={[
                { header: "Asset #", accessorKey: "assetNumber", cell: (a: Asset) => <span className="font-medium">{a.assetNumber}</span> },
                { header: "Description", accessorKey: "description" },
                { header: "Status", accessorKey: "status", cell: (a: Asset) => <Badge variant="outline">{a.status}</Badge> },
                { header: "Model", accessorKey: "model", cell: (a: Asset) => a.model || '-' },
                { header: "Serial #", accessorKey: "serialNumber", cell: (a: Asset) => a.serialNumber || '-' }
            ]}
            keyExtractor={(a: Asset) => a.id}
        />
    );
}
