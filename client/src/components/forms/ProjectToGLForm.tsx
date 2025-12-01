import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Project {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: string;
  department: string;
}

export function ProjectToGLForm({ project, onClose }: { project: Project; onClose: () => void }) {
  const { toast } = useToast();
  const [accountCode, setAccountCode] = useState("6000");
  const [amount, setAmount] = useState(project.spent.toString());

  const createGLEntryMutation = useMutation({
    mutationFn: async () => {
      const glAmount = parseFloat(amount);
      return apiRequest("POST", "/api/ledger", {
        accountCode,
        description: `Project Cost: ${project.name}`,
        debit: glAmount,
        credit: 0,
        department: project.department,
        linkedProjectId: project.id,
        referenceType: "PROJECT",
        status: "posted"
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `GL entry created for ${project.name}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create GL entry",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          Project Cost to GL Entry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Record project costs in general ledger for financial reporting</p>
      </div>

      <Card className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project:</span>
              <Badge variant="default">{project.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Budget:</span>
              <span className="font-semibold">${project.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount Spent:</span>
              <span className="font-semibold text-red-600">${project.spent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge>{project.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5" />
            GL Entry Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account-code">GL Account Code</Label>
              <Input
                id="account-code"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="6000"
                data-testid="input-account-code"
              />
            </div>
            <div>
              <Label htmlFor="amount">Debit Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>
          </div>

          <Card className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                This creates a debit entry in GL account {accountCode} for project cost tracking and profit analysis. Links bidirectionally to project.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => createGLEntryMutation.mutate()} disabled={createGLEntryMutation.isPending} className="flex-1" data-testid="button-create-gl">
          {createGLEntryMutation.isPending ? "Creating..." : "Create GL Entry"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
