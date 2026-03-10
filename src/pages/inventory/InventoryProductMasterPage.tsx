import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus, Star, Globe, Tag } from "lucide-react";

const products = [
    { id: "PRD-001", name: "NexusCPU Workstation Pro", sku: "NCP-WS-PRO", family: "Computing", lifecycle: "Maturity", price: "$4,299", currency: "USD", status: "Active", variants: 3 },
    { id: "PRD-002", name: "SecureGuard Firewall 5000", sku: "SG-FW-5000", family: "Security", lifecycle: "Growth", price: "$12,800", currency: "USD", status: "Active", variants: 2 },
    { id: "PRD-003", name: "CloudSync Storage Array", sku: "CS-SA-4TB", family: "Storage", lifecycle: "Introduction", price: "$7,650", currency: "USD", status: "Active", variants: 4 },
    { id: "PRD-004", name: "SmartHub IoT Gateway", sku: "SH-IOT-GW", family: "Networking", lifecycle: "Decline", price: "$890", currency: "USD", status: "Inactive", variants: 1 },
    { id: "PRD-005", name: "DataCore Analytics Suite", sku: "DC-ANL-SW", family: "Software", lifecycle: "Growth", price: "$24,999", currency: "USD", status: "Active", variants: 1 },
];

const lifeCycleBadge: Record<string, string> = {
    Introduction: "bg-blue-100 text-blue-800",
    Growth: "bg-green-100 text-green-800",
    Maturity: "bg-amber-100 text-amber-800",
    Decline: "bg-red-100 text-red-800",
};

export default function InventoryProductMasterPage() {
    return (
        <StandardPage
            title="Product Master"
            description="Product catalog, pricing, and lifecycle management"
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Product Master" }]}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Products", value: products.length, icon: Package },
                        { label: "Active", value: products.filter(p => p.status === "Active").length, icon: Star },
                        { label: "Product Families", value: new Set(products.map(p => p.family)).size, icon: Globe },
                        { label: "Total Variants", value: products.reduce((s, p) => s + p.variants, 0), icon: Tag },
                    ].map(kpi => (
                        <Card key={kpi.label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <kpi.icon className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <p className="text-xl font-bold">{kpi.value}</p>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Product Catalog</CardTitle>
                        <Button size="sm"><Plus className="h-3 w-3 mr-1" /> Add Product</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="text-left py-3 pr-4">Product ID</th>
                                        <th className="text-left py-3 pr-4">Name</th>
                                        <th className="text-left py-3 pr-4">SKU</th>
                                        <th className="text-left py-3 pr-4">Family</th>
                                        <th className="text-left py-3 pr-4">Lifecycle</th>
                                        <th className="text-left py-3 pr-4">Price</th>
                                        <th className="text-left py-3 pr-4">Variants</th>
                                        <th className="text-left py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(prod => (
                                        <tr key={prod.id} className="border-b hover:bg-muted/50 transition-colors cursor-pointer">
                                            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{prod.id}</td>
                                            <td className="py-3 pr-4 font-medium">{prod.name}</td>
                                            <td className="py-3 pr-4 font-mono text-xs">{prod.sku}</td>
                                            <td className="py-3 pr-4">{prod.family}</td>
                                            <td className="py-3 pr-4">
                                                <Badge className={`${lifeCycleBadge[prod.lifecycle]} border-0 text-xs`}>{prod.lifecycle}</Badge>
                                            </td>
                                            <td className="py-3 pr-4 font-semibold">{prod.price}</td>
                                            <td className="py-3 pr-4">{prod.variants}</td>
                                            <td className="py-3">
                                                <Badge className={prod.status === "Active" ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                                                    {prod.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
