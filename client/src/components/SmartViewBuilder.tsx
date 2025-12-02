import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SmartViewBuilderProps {
  formId: string;
  onViewSelect?: (viewId: string) => void;
}

export function SmartViewBuilder({ formId, onViewSelect }: SmartViewBuilderProps) {
  const [open, setOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [filters, setFilters] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: smartViews = [] } = useQuery({
    queryKey: ["/api/smartviews", formId],
  });

  const createViewMutation = useMutation({
    mutationFn: (data) =>
      apiRequest("POST", `/api/smartviews`, {
        formId,
        name: viewName,
        filters,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smartviews", formId] });
      toast({ title: "SmartView created", description: `View "${viewName}" saved successfully` });
      setViewName("");
      setFilters([]);
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to create view",
        description: "Could not save the SmartView",
        variant: "destructive",
      });
    },
  });

  const deleteViewMutation = useMutation({
    mutationFn: (viewId: string) => apiRequest("DELETE", `/api/smartviews/${viewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smartviews", formId] });
      toast({ title: "SmartView deleted" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">SmartViews</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-smartview">
              <Plus className="h-4 w-4 mr-1" />
              New View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create SmartView</DialogTitle>
              <DialogDescription>Save a custom view with filters and sorting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="View name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                data-testid="input-smartview-name"
              />
              <Button
                onClick={() => createViewMutation.mutate({})}
                disabled={!viewName || createViewMutation.isPending}
                data-testid="button-save-smartview"
              >
                <Save className="h-4 w-4 mr-2" />
                Save View
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {smartViews.length > 0 ? (
          smartViews.map((view: any) => (
            <Card key={view.id} className="hover-elevate cursor-pointer" data-testid={`card-smartview-${view.id}`}>
              <CardContent className="p-3 flex items-center justify-between">
                <div onClick={() => onViewSelect?.(view.id)} className="flex-1">
                  <p className="font-medium text-sm">{view.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {view.filters?.length || 0} filters
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteViewMutation.mutate(view.id)}
                  data-testid={`button-delete-smartview-${view.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No SmartViews yet. Create one to save custom filters.
          </p>
        )}
      </div>
    </div>
  );
}
