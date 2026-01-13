import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Warehouse, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { LotSerialManager } from "./inventory/LotSerialManager";

export default function Inventory() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState("items");
  const [itemPage, setItemPage] = useState(1);
  const [itemPageSize] = useState(10);
  const [whPage, setWhPage] = useState(1);
  const [whPageSize] = useState(10);

  const [newItem, setNewItem] = useState({ itemNumber: "", description: "", quantity: "0", categoryName: "" });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", code: "", locationCode: "" });

  const { data: itemsData, isLoading: itemsLoading } = useQuery<{ data: any[], total: number }>({
    queryKey: ["/api/inventory/items", itemPage, itemPageSize],
    queryFn: () => fetch(`/api/inventory/items?limit=${itemPageSize}&offset=${(itemPage - 1) * itemPageSize}`).then(r => r.json())
  });

  const { data: warehousesData, isLoading: whLoading } = useQuery<{ data: any[], total: number }>({
    queryKey: ["/api/inventory/warehouses", whPage, whPageSize],
    queryFn: () => fetch(`/api/inventory/warehouses?limit=${whPageSize}&offset=${(whPage - 1) * whPageSize}`).then(r => r.json())
  });

  const items = itemsData?.data || [];
  const itemsTotal = itemsData?.total || 0;
  const warehouses = warehousesData?.data || [];
  const whTotal = warehousesData?.total || 0;

  const createItemMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      setNewItem({ itemNumber: "", description: "", quantity: "0", categoryName: "" });
      toast({ title: "Item created" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inventory/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      toast({ title: "Item deleted" });
    },
  });

  const createWhMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inventory/warehouses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/warehouses"] });
      setNewWarehouse({ name: "", code: "", locationCode: "" });
      toast({ title: "Warehouse created" });
    },
  });

  const deleteWhMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inventory/warehouses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/warehouses"] });
      toast({ title: "Warehouse deleted" });
    },
  });

  const lowStockItemsCount = items.filter((item: any) => (item.quantityOnHand || 0) <= (item.minQuantity || 10)).length;

  const itemColumns: Column<any>[] = [
    { header: "Item Number", accessorKey: "itemNumber" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Quantity",
      accessorKey: "quantityOnHand",
      cell: (val: any) => <span className="font-mono">{val}</span>
    },
    {
      header: "Organization",
      accessorKey: "organization",
      cell: (val: any) => val?.name || "N/A"
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (id: any) => (
        <Button size="icon" variant="ghost" onClick={() => deleteItemMutation.mutate(id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )
    }
  ];

  const whColumns: Column<any>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Code", accessorKey: "code" },
    { header: "Location", accessorKey: "locationCode" },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (id: any) => (
        <Button size="icon" variant="ghost" onClick={() => deleteWhMutation.mutate(id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track persistent inventory items and organizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Items (All)</p>
                <p className="text-2xl font-bold">{itemsTotal}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Warehouses (All)</p>
                <p className="text-2xl font-bold">{whTotal}</p>
              </div>
              <Warehouse className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Low Stock (Page)</p>
                <p className="text-2xl font-bold">{lowStockItemsCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={viewType === "items" ? "default" : "outline"} onClick={() => setViewType("items")}>Items</Button>
        <Button variant={viewType === "warehouses" ? "default" : "outline"} onClick={() => setViewType("warehouses")}>Warehouses</Button>
        <Button variant={viewType === "traceability" ? "default" : "outline"} onClick={() => setViewType("traceability")}>Traceability</Button>
      </div>

      {viewType === "items" && (
        <div className="space-y-4 p-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add New Item</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Item Number" value={newItem.itemNumber} onChange={(e) => setNewItem({ ...newItem, itemNumber: e.target.value })} />
                <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                <Input placeholder="Initial Qty" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
              </div>
              <Button disabled={createItemMutation.isPending || !newItem.itemNumber} className="w-full" onClick={() => createItemMutation.mutate(newItem)}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Inventory Items</CardTitle></CardHeader>
            <CardContent>
              <StandardTable
                data={items}
                columns={itemColumns}
                isLoading={itemsLoading}
                page={itemPage}
                pageSize={itemPageSize}
                totalItems={itemsTotal}
                onPageChange={setItemPage}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === "warehouses" && (
        <div className="space-y-4 p-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add Warehouse</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Name" value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} />
                <Input placeholder="Code" value={newWarehouse.code} onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })} />
                <Input placeholder="Location" value={newWarehouse.locationCode} onChange={(e) => setNewWarehouse({ ...newWarehouse, locationCode: e.target.value })} />
              </div>
              <Button disabled={createWhMutation.isPending || !newWarehouse.name} className="w-full" onClick={() => createWhMutation.mutate(newWarehouse)}>
                <Plus className="w-4 h-4 mr-2" /> Add Warehouse
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Warehouses</CardTitle></CardHeader>
            <CardContent>
              <StandardTable
                data={warehouses}
                columns={whColumns}
                isLoading={whLoading}
                page={whPage}
                pageSize={whPageSize}
                totalItems={whTotal}
                onPageChange={setWhPage}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === "traceability" && (
        <LotSerialManager />
      )}
    </div>
  );
}
