import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Package, Tag, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
import { StandardPage } from "@/components/layout/StandardPage";


interface Item {
    id: string;
    itemNumber: string;
    description: string;
    category?: string;
    uom?: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
}

export default function ItemMasterUI() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [activeSetId, setActiveSetId] = useState<string | undefined>();

    const [formData, setFormData] = useState({
        itemNumber: "",
        description: "",
        category: "",
        uom: "EA",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const queryClient = useQueryClient();

    const setHeaders = activeSetId ? { "x-set-id": activeSetId } : {};

    // Fetch items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["/api/mdm/items", searchQuery, activeSetId],
        queryFn: async () => {
            const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
            const res = await fetch(`/api/mdm/items${params}`, { headers: setHeaders });
            return res.json();
        },
    });

    // Create item
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/mdm/items", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...setHeaders },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/items"] });
            setIsCreateOpen(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setFormData({
            itemNumber: "",
            description: "",
            category: "",
            uom: "EA",
            status: "ACTIVE",
        });
    };

    return (
        <StandardPage title="Item Master (PIM)">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">
                        Product Information Management
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <EnterpriseContextSwitcher
                        type="set"
                        value={activeSetId}
                        onChange={setActiveSetId}
                    />
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Item</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="itemNumber">Item Number</Label>
                                        <Input
                                            id="itemNumber"
                                            value={formData.itemNumber}
                                            onChange={(e) => setFormData({ ...formData, itemNumber: e.target.value })}
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="uom">Unit of Measure</Label>
                                        <Input
                                            id="uom"
                                            value={formData.uom}
                                            onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                                            placeholder="EA, KG, LB"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Product description"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Electronics, Furniture, etc."
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => createMutation.mutate(formData)}
                                        disabled={!formData.itemNumber || !formData.description || createMutation.isPending}
                                        className="flex-1"
                                    >
                                        Create Item
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items by number, description, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p className="col-span-full text-center py-12 text-muted-foreground">
                        Loading items...
                    </p>
                ) : items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No items found</p>
                        <p className="text-sm">Create your first item to get started</p>
                    </div>
                ) : (
                    items.map((item: Item) => (
                        <Card
                            key={item.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedItem(item)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{item.itemNumber}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-1">
                                            {item.description}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                                        {item.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {item.category && (
                                        <Badge variant="outline">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {item.category}
                                        </Badge>
                                    )}
                                    {item.uom && (
                                        <Badge variant="outline">{item.uom}</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    Created: {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Item Detail Dialog */}
            {selectedItem && (
                <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{selectedItem.itemNumber}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="details">
                            <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                                <TabsTrigger value="images">Images</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="space-y-4">
                                <div>
                                    <Label>Description</Label>
                                    <p className="text-sm">{selectedItem.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Category</Label>
                                        <p className="text-sm">{selectedItem.category || "—"}</p>
                                    </div>
                                    <div>
                                        <Label>UOM</Label>
                                        <p className="text-sm">{selectedItem.uom || "—"}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Badge className="mt-1">{selectedItem.status}</Badge>
                                </div>
                            </TabsContent>
                            <TabsContent value="attributes">
                                <p className="text-sm text-muted-foreground py-8 text-center">
                                    Attribute management coming soon
                                </p>
                            </TabsContent>
                            <TabsContent value="images">
                                <div className="text-center py-12 text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Image upload coming soon</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}
        </StandardPage>
    );
}
