import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Tag, Ruler, Globe, BarChart3 } from "lucide-react";

const items = [
    { id: "ITM-001", name: "Industrial Widget A", sku: "W-001-A", uom: "PCS", category: "Finished Goods", weight: "0.5 kg", trackLot: true, trackSerial: false, status: "Active" },
    { id: "ITM-002", name: "Component B-42", sku: "C-042-B", uom: "EA", category: "Raw Materials", weight: "1.2 kg", trackLot: true, trackSerial: true, status: "Active" },
    { id: "ITM-003", name: "Assembly Bracket", sku: "AB-110", uom: "PCS", category: "WIP", weight: "0.8 kg", trackLot: false, trackSerial: true, status: "Active" },
    { id: "ITM-004", name: "Packaging Box M", sku: "PKG-M-01", uom: "BOX", category: "Packaging", weight: "0.1 kg", trackLot: false, trackSerial: false, status: "Inactive" },
    { id: "ITM-005", name: "Electronic Module X", sku: "EM-X-789", uom: "EA", category: "Finished Goods", weight: "0.3 kg", trackLot: true, trackSerial: true, status: "Active" },
];

export default function InventoryItemProfilePage() {
    return (
        <StandardPage
            title="Item Profile"
            description="Item attributes, unit of measure, lot and serial number tracking configuration"
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Item Profile" }]}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Items", value: items.length, icon: Package },
                        { label: "Lot Tracked", value: items.filter(i => i.trackLot).length, icon: Tag },
                        { label: "Serial Tracked", value: items.filter(i => i.trackSerial).length, icon: Ruler },
                        { label: "Active", value: items.filter(i => i.status === "Active").length, icon: Globe },
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
                        <CardTitle className="text-sm">Item Master</CardTitle>
                        <Button size="sm"><Package className="h-3 w-3 mr-1" /> Add Item</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                                        <th className="text-left py-3 pr-4">Item ID</th>
                                        <th className="text-left py-3 pr-4">Name</th>
                                        <th className="text-left py-3 pr-4">SKU</th>
                                        <th className="text-left py-3 pr-4">UOM</th>
                                        <th className="text-left py-3 pr-4">Category</th>
                                        <th className="text-left py-3 pr-4">Lot / Serial</th>
                                        <th className="text-left py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{item.id}</td>
                                            <td className="py-3 pr-4 font-medium">{item.name}</td>
                                            <td className="py-3 pr-4 font-mono text-xs">{item.sku}</td>
                                            <td className="py-3 pr-4">{item.uom}</td>
                                            <td className="py-3 pr-4">{item.category}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex gap-1">
                                                    {item.trackLot && <Badge variant="outline" className="text-[10px] py-0 text-blue-600">Lot</Badge>}
                                                    {item.trackSerial && <Badge variant="outline" className="text-[10px] py-0 text-purple-600">Serial</Badge>}
                                                    {!item.trackLot && !item.trackSerial && <span className="text-muted-foreground text-xs">—</span>}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <Badge className={item.status === "Active" ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                                                    {item.status}
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
