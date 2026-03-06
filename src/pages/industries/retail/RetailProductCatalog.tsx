import { cn } from "@/lib/utils";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useQuery } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function RetailProductCatalog() {
  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/retail-products'],
    queryFn: () => fetch("/api/retail-products").then(r => r.json())
  });

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "name",
      header: "Product Name",
      width: "35%",
      cell: (item: any) => (
        <div className="p-2">
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.sku}</div>
        </div>
      )
    },
    {
      id: "category",
      header: "Category",
      width: "20%",
      cell: (item: any) => <div className="p-2">{item.category}</div>
    },
    {
      id: "price",
      header: "Price",
      width: "15%",
      cell: (item: any) => <div className="p-2 font-mono">₹{item.price}</div>
    },
    {
      id: "quantity",
      header: "Stock",
      width: "20%",
      cell: (item: any) => (
        <div className={cn(`p-2 font-medium ${item.quantity > 0 ? "text-green-600" : "text-red-500"}`)}>
          {item.quantity}
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      width: "10%",
      cell: () => (
        <div className="p-2 flex gap-2 justify-end">
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
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="border rounded-md">
          <InteractiveSpreadsheet
            data={products}
            columns={columns}
            virtualized={true}
            containerHeight="600px"
            onChange={() => { }}
          />
        </div>
      )}
    </StandardPage>
  );
}
