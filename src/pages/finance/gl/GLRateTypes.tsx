import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function GLRateTypes() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ rateType: "", description: "" });

  const { data: rateTypes, isLoading } = useQuery({
    queryKey: ["/api/gl/config/rate-types"],
    queryFn: async () => {
      const res = await fetch("/api/gl/config/rate-types");
      if (!res.ok) throw new Error("Failed to fetch rate types");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/gl/config/rate-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create rate type");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gl/config/rate-types"] });
      setIsFormOpen(false);
      setFormData({ rateType: "", description: "" });
      toast({ title: "Success", description: "Rate type created successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns: Column<any>[] = [
    { header: "Rate Type", accessorKey: "rateType", className: "font-medium" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (row) => row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "N/A"
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="GL Rate Types"
      description="Manage global exchange rate types"
      actions={
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Rate Type
        </Button>
      }
    >

      <StandardTable
        data={rateTypes || []}
        columns={columns}
        isLoading={isLoading}
        filterColumn="rateType"
        filterPlaceholder="Search rate types..."
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Rate Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rate Type Name</Label>
              <Input
                required
                placeholder="e.g. Spot, Corporate"
                value={formData.rateType}
                onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Rate Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </StandardPage>
  );
}
