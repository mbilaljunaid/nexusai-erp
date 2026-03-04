import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useEffect } from "react";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  status: z.enum(["active", "inactive"]).default("active")
});

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

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      category: "",
      email: "",
      status: "active"
    }
  });

  useEffect(() => {
    if (isSheetOpen) {
      if (editingSupplier) {
        form.reset({
          name: editingSupplier.name || "",
          category: editingSupplier.category || "",
          email: editingSupplier.email || "",
          status: editingSupplier.status || "active"
        });
      } else {
        form.reset({
          name: "",
          category: "",
          email: "",
          status: "active"
        });
      }
    }
  }, [isSheetOpen, editingSupplier, form]);

  const onSubmit = (values: z.infer<typeof supplierSchema>) => {
    mutation.mutate(values);
  };

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Logistics">Logistics</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save Supplier"}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      }
    >
      <InteractiveSpreadsheet
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        onChange={() => { }} containerHeight="600px" />
    </StandardPage>
  );
}
