import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExpenseLine {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: string;
  receipt: string;
}

export function ExpenseEntryForm() {
  const { toast } = useToast();
  const [project, setProject] = useState("");
  const [employee, setEmployee] = useState("");
  const [lines, setLines] = useState<ExpenseLine[]>([
    { id: 1, date: "", category: "", description: "", amount: "", receipt: "" }
  ]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/finance/expenses", {
        projectId: project,
        employeeId: employee,
        items: lines.map(l => ({
          date: l.date,
          category: l.category,
          description: l.description,
          amount: parseFloat(l.amount),
          receipt: l.receipt
        }))
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Expense report submitted successfully" });
      setProject("");
      setEmployee("");
      setLines([{ id: 1, date: "", category: "", description: "", amount: "", receipt: "" }]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit expense report", variant: "destructive" });
    }
  });

  const addLine = () => {
    setLines(prev => [...prev, {
      id: Math.max(...prev.map(l => l.id), 0) + 1,
      date: "",
      category: "",
      description: "",
      amount: "",
      receipt: ""
    }]);
  };

  const removeLine = (id: number) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const updateLine = (id: number, field: string, value: string) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Expense Entry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Submit and track project expenses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expense Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proj1">Project Alpha</SelectItem>
                  <SelectItem value="proj2">Project Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp">Employee</Label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger id="emp">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Badge>Draft</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Expense Items</h3>
              <Button size="sm" onClick={addLine} className="gap-1">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Category</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-right py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Receipt</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => (
                    <tr key={line.id} className="border-b">
                      <td className="py-2 px-2"><Input type="date" value={line.date} onChange={(e) => updateLine(line.id, "date", e.target.value)} className="text-xs" /></td>
                      <td className="py-2 px-2">
                        <Select value={line.category} onValueChange={(v) => updateLine(line.id, "category", v)}>
                          <SelectTrigger className="text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="meals">Meals</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2"><Input placeholder="Desc" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} className="text-xs" /></td>
                      <td className="py-2 px-2"><Input type="number" placeholder="0" value={line.amount} onChange={(e) => updateLine(line.id, "amount", e.target.value)} className="text-xs text-right" /></td>
                      <td className="py-2 px-2"><Input placeholder="Receipt #" value={line.receipt} onChange={(e) => updateLine(line.id, "receipt", e.target.value)} className="text-xs" /></td>
                      <td className="py-2 px-2"><Button variant="ghost" size="sm" onClick={() => removeLine(line.id)}><Trash2 className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted">
                    <td colSpan={3} className="py-2 px-2">Total Expenses</td>
                    <td className="py-2 px-2 text-right">${total.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="outline">Save Draft</Button>
            <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
