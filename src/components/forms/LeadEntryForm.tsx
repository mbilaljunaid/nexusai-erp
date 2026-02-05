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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LeadEntryForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [score, setScore] = useState("0");
  const [status, setStatus] = useState("new");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveLead = async () => {
    if (!name || !email) {
      toast({ title: "Error", description: "Name and Email are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        company: company || undefined,
        score: score || "0",
        status
      };
      
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error("Failed to create lead");
      
      setSuccessMessage("Lead saved successfully!");
      toast({ title: "Success", description: "Lead created" });
      
      // Reset form
      setName("");
      setEmail("");
      setCompany("");
      setScore("0");
      setStatus("new");
      
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
        <h2 className="text-2xl font-semibold">Add Lead</h2>
        <p className="text-sm text-muted-foreground mt-1">Create and qualify new sales leads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Details</CardTitle>
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
                data-testid="input-lead-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="text-sm"
                data-testid="input-lead-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="text-sm"
                data-testid="input-lead-company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Lead Score</Label>
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0-100"
                min="0"
                max="100"
                className="text-sm"
                data-testid="input-lead-score"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSaveLead}
              disabled={isLoading}
              data-testid="button-save-lead"
            >
              {isLoading ? "Saving..." : successMessage ? "Saved!" : "Save Lead"}
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
