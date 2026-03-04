import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  category: string;
  email: string;
  status: "active" | "inactive";
}

export default function SupplierManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/procurement/suppliers"],
    queryFn: async () => {
      const res = await fetch("/api/procurement/suppliers");
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const res = await fetch("/api/procurement/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save supplier");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
      setIsSheetOpen(false);
      setEditingSupplier(null);
      toast({ title: "Success", description: "Supplier saved successfully" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const columns: SpreadsheetColumn<Supplier>[] = [
    { header: "Name", id: "name", width: "150px", cell: (row: Supplier) => <span className="font-semibold">{row.name}</span> },
    { header: "Category", id: "category", width: "150px" },
    { header: "Email", id: "email", width: "150px", cell: (row: Supplier) => <span className="text-muted-foreground">{row.email}</span> },
    { header: "Status", id: "status", width: "150px", cell: (row: Supplier) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge> },
    {
      header: "Actions", id: "actions", cell: (row: Supplier) => (
        <Button variant="ghost" size="sm" onClick={() => { setEditingSupplier(row); setIsSheetOpen(true); }}>
          <Edit2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      email: formData.get("email") as string,
      status: formData.get("status") as any || "active"
    };
    mutation.mutate(data);
  };

  return (
    <StandardPage
      title="Supplier Management"
      description="Manage supplier relationships, categories, and performance"
      breadcrumbs={[{ label: "SCM", href: "/scm" }, { label: "Suppliers" }]}
      actions={
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingSupplier(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Supplier
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingSupplier ? 'Edit' : 'Add'} Supplier</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input id="name" name="name" defaultValue={editingSupplier?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingSupplier?.category}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingSupplier?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingSupplier?.status || "active"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Supplier"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      }
    >
      <InteractiveSpreadsheet
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
       onChange={() => {}} containerHeight="600px" />
    </StandardPage>
  );
}
