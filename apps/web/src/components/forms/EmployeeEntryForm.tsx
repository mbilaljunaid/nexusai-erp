import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EmployeeEntryForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveEmployee = async () => {
    if (!name || !email) {
      toast({ title: "Error", description: "Name and Email are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        department: department || undefined,
        role: role || undefined,
        salary: salary || undefined
      };

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to create employee");

      setSuccessMessage("Employee saved successfully!");
      toast({ title: "Success", description: "Employee created" });

      // Reset form
      setName("");
      setEmail("");
      setDepartment("");
      setRole("");
      setSalary("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Add Employee</h2>
        <p className="text-sm text-muted-foreground mt-1">Add a new employee to the organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="text-sm"
                data-testid="input-employee-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="text-sm"
                data-testid="input-employee-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering"
                className="text-sm"
                data-testid="input-employee-department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Engineer"
                className="text-sm"
                data-testid="input-employee-role"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="75000.00"
                step="0.01"
                className="text-sm"
                data-testid="input-employee-salary"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveEmployee}
              disabled={isLoading}
              data-testid="button-save-employee"
            >
              {isLoading ? "Saving..." : successMessage ? "Saved!" : "Save Employee"}
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>

          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-900 dark:text-green-100 ml-2">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
