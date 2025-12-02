import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecipeFormulation() {
  const { toast } = useToast();
  const [newRecipe, setNewRecipe] = useState({ recipeId: "", name: "", yield: "100", status: "draft" });

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["/api/fb-recipes"],
    queryFn: () => fetch("/api/fb-recipes").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-recipes"] });
      setNewRecipe({ recipeId: "", name: "", yield: "100", status: "draft" });
      toast({ title: "Recipe created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-recipes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-recipes"] });
      toast({ title: "Recipe deleted" });
    },
  });

  const approved = recipes.filter((r: any) => r.status === "approved").length;
  const draft = recipes.filter((r: any) => r.status === "draft").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Recipe & Formulation Management
        </h1>
        <p className="text-muted-foreground mt-2">Recipe editor, versioning, nutrition calculation, and label generation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Recipes</p>
            <p className="text-2xl font-bold">{recipes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{draft}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approval %</p>
            <p className="text-2xl font-bold">{recipes.length > 0 ? ((approved / recipes.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-recipe">
        <CardHeader><CardTitle className="text-base">Create Recipe</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Recipe ID" value={newRecipe.recipeId} onChange={(e) => setNewRecipe({ ...newRecipe, recipeId: e.target.value })} data-testid="input-rid" className="text-sm" />
            <Input placeholder="Recipe Name" value={newRecipe.name} onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Yield %" type="number" value={newRecipe.yield} onChange={(e) => setNewRecipe({ ...newRecipe, yield: e.target.value })} data-testid="input-yield" className="text-sm" />
            <Input placeholder="Status" disabled value="draft" data-testid="input-status" className="text-sm" />
            <Button disabled={createMutation.isPending || !newRecipe.recipeId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recipes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : recipes.length === 0 ? <p className="text-muted-foreground text-center py-4">No recipes</p> : recipes.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`recipe-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">Yield: {r.yield}%</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "approved" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${r.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
