import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';
import { Badge } from "@/components/ui/badge";

export function APMasterData() {
    const [payGroups] = useState([
        { id: "1", name: "Priority 1", description: "Critical suppliers, immediate processing", defaultPriority: 1, active: true },
        { id: "2", name: "Standard", description: "Normal run suppliers", defaultPriority: 2, active: true },
        { id: "3", name: "Employees", description: "Employee expense reimbursements", defaultPriority: 3, active: true },
        { id: "4", name: "Taxes", description: "Tax authorities", defaultPriority: 1, active: true }
    ]);

    const [paymentMethods] = useState([
        { id: "1", name: "Electronic (ACH)", type: "EFT", active: true },
        { id: "2", name: "Wire Transfer", type: "Wire", active: true },
        { id: "3", name: "Paper Check", type: "Check", active: true },
        { id: "4", name: "Virtual Card", type: "Card", active: true }
    ]);

    const payGroupColumns: Column<any>[] = [
        { header: "Pay Group Name", accessorKey: "name", className: "font-medium text-indigo-600" },
        { header: "Description", accessorKey: "description" },
        { header: "Default Priority", accessorKey: "defaultPriority" },
        {
            header: "Status",
            accessorKey: "active",
            cell: (row) => <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Active" : "Inactive"}</Badge>
        }
    ];

    const paymentMethodColumns: Column<any>[] = [
        { header: "Method Name", accessorKey: "name", className: "font-medium" },
        { header: "Type", accessorKey: "type" },
        {
            header: "Status",
            accessorKey: "active",
            cell: (row) => <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Active" : "Inactive"}</Badge>
        }
    ];

    return (
        <StandardPage
            title="Master Data"
            description="Configure core lookups, pay groups, and payment methods"
        >
            <Card>
                <CardContent>
                    <Tabs defaultValue="pay_groups" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="pay_groups">Pay Groups</TabsTrigger>
                            <TabsTrigger value="payment_methods">Payment Methods</TabsTrigger>
                            <TabsTrigger value="document_sequences">Document Sequencing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pay_groups" className="space-y-4">
                            <div className="flex justify-end">
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Add Pay Group
                                </Button>
                            </div>
                            <StandardTable
                                data={payGroups}
                                columns={payGroupColumns}
                                filterColumn="name"
                            />
                        </TabsContent>

                        <TabsContent value="payment_methods" className="space-y-4">
                            <div className="flex justify-end">
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                                </Button>
                            </div>
                            <StandardTable
                                data={paymentMethods}
                                columns={paymentMethodColumns}
                                filterColumn="name"
                            />
                        </TabsContent>

                        <TabsContent value="document_sequences" className="space-y-4">
                            <div className="p-8 text-center border rounded-md border-dashed text-muted-foreground">
                                <h3 className="font-medium text-lg mb-2 text-foreground">Document Sequence Management</h3>
                                <p>Configure prefixes and sequences for automatic invoice numbering across different business units.</p>
                                <Button className="mt-4" variant="outline">Configure Sequences</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
