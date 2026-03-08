import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoRequisitionForm } from "@/components/forms/AutoRequisitionForm";
import { AlertTriangle } from "lucide-react";

const lowStockItems = [
    { id: "1", itemName: "Widget A", sku: "W-001", quantity: 5, reorderLevel: 20, reorderQuantity: 100 },
    { id: "2", itemName: "Component B", sku: "C-002", quantity: 12, reorderLevel: 50, reorderQuantity: 200 },
    { id: "3", itemName: "Material C", sku: "M-003", quantity: 8, reorderLevel: 30, reorderQuantity: 150 },
    { id: "4", itemName: "Part D", sku: "P-004", quantity: 3, reorderLevel: 25, reorderQuantity: 120 },
    { id: "5", itemName: "Component E", sku: "C-005", quantity: 7, reorderLevel: 40, reorderQuantity: 180 },
];

export default function InventoryCycleCountPage() {
    return (
        <StandardPage
            title="Cycle Count & Reorder Points"
            description="Physical cycle count audit and reorder point management"
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Cycle Count" }]}
        >
            <div className="space-y-4">
                <Card className="bg-orange-500/10 border border-orange-200 dark:border-orange-800">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Low Stock Items — Auto-Requisition Ready
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            {lowStockItems.length} items need attention. Click "Create Auto-Requisition" to automatically trigger purchase workflow.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                            <div className="flex flex-col items-center p-3 bg-red-500/10 rounded-lg border border-red-200 dark:border-red-800">
                                <span className="text-2xl font-bold text-red-600">{lowStockItems.filter(i => i.quantity < 10).length}</span>
                                <span className="text-muted-foreground">Critical (&lt; 10 units)</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                <span className="text-2xl font-bold text-amber-600">{lowStockItems.filter(i => i.quantity >= 10 && i.quantity < i.reorderLevel).length}</span>
                                <span className="text-muted-foreground">Below Reorder Level</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-green-500/10 rounded-lg border border-green-200 dark:border-green-800">
                                <span className="text-2xl font-bold text-green-600">{lowStockItems.reduce((s, i) => s + i.reorderQuantity, 0)}</span>
                                <span className="text-muted-foreground">Units to Replenish</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {lowStockItems.map(item => (
                        <AutoRequisitionForm key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </StandardPage>
    );
}
