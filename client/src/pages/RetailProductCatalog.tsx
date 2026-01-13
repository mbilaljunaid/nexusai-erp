import { StandardTable } from "@/components/ui/StandardTable";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { StandardPage } from "@/components/ui/StandardPage";

export default function RetailProductCatalog() {
  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/retail-products'],
    queryFn: () => fetch("/api/retail-products").then(r => r.json()).catch(() => [])
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.sku}</div>
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="font-mono">₹{row.original.price}</span>
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => (
        <span className={row.original.quantity > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
          {row.original.quantity}
        </span>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex gap-2 justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Product Catalog"
      description={`Manage your retail product inventory. Total items: ${products.length}`}
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      }
    >
      <StandardTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        filterColumn="name"
        filterPlaceholder="Search products by name..."
      />
    </StandardPage>
  );
}
