import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function ItemProfile() {
    const [, params] = useRoute("/mdm/items/:id");
    const itemId = (params as any)?.id;
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    const { data: item, isLoading } = useQuery<any>({
        queryKey: [`/api/mdm/items/${itemId}`],
        enabled: !!itemId
    });

    if (isLoading) return <div>Loading...</div>;
    if (!item) return <div>Item not found</div>;

    return (
        <StandardPage
            title={item.itemName}
            description={`Item Number: ${item.itemNumber}`}
            breadcrumbs={[
                { label: "MDM", href: "/mdm/governance" },
                { label: "Item Master", href: "/mdm/items" },
                { label: item.itemNumber }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/mdm/items")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button>
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6">
                {/* Header Stats */}
                <div className="flex gap-6 p-4 bg-card border rounded-lg shadow-sm">
                    <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <div className="mt-1">
                            <Badge variant={item.itemStatus === "ACTIVE" ? "default" : "secondary"}>
                                {item.itemStatus}
                            </Badge>
                        </div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Type</Label>
                        <div className="mt-1 font-medium">{item.itemType}</div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Primary UOM</Label>
                        <div className="mt-1 font-medium">{item.primaryUomCode}</div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Organization</Label>
                        <div className="mt-1 font-medium">{item.organizationId}</div>
                    </div>
                </div>

                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="relationships">Relationships</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Specifications</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Item Description</Label>
                                    <Input defaultValue={item.description} />
                                </div>
                                <div>
                                    <Label>Revision</Label>
                                    <Input defaultValue={item.revision} disabled />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="categories">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Assigned Categories</CardTitle>
                                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
                            </CardHeader>
                            <CardContent>
                                {item.categories && item.categories.length > 0 ? (
                                    <div className="space-y-2">
                                        {item.categories.map((cat: any) => (
                                            <div key={cat.id} className="flex justify-between items-center p-3 border rounded-md">
                                                <div>
                                                    <div className="font-medium">{cat.categoryName}</div>
                                                    <div className="text-xs text-muted-foreground">{cat.categorySet}</div>
                                                </div>
                                                <Button variant="ghost" size="sm">Remove</Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No categories assigned.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="relationships">
                        <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                            Item Relationships (Substitutes, BOM) coming in Phase 12.
                        </div>
                    </TabsContent>
                    <TabsContent value="inventory">
                        <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                            Inventory balances coming in SCM Module.
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
