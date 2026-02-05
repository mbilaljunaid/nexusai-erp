import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import type { Lead } from "./LeadCard";

interface AddLeadDialogProps {
  onAddLead?: (lead: Omit<Lead, "id" | "score">) => void;
}

export function AddLeadDialog({ onAddLead }: AddLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    status: "new" as Lead["status"],
    value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.company) {
      alert("Please fill in all required fields");
      return;
    }

    setIsScoring(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          status: formData.status,
          score: parseInt(formData.value) || 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to create lead");

      const newLead = await response.json();
      onAddLead?.(newLead);
      setOpen(false);
      setFormData({ name: "", email: "", company: "", status: "new", value: "" });
    } catch (err) {
      console.error("Error adding lead:", err);
      alert("Failed to add lead");
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-lead">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-lead">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter lead information. AI will automatically score the lead based on the data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-lead-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-lead-email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company Inc."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                data-testid="input-lead-company"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as Lead["status"] })}
                >
                  <SelectTrigger data-testid="select-lead-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Deal Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="10000"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  data-testid="input-lead-value"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isScoring} data-testid="button-submit-lead">
              {isScoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI Scoring...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add & Score
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
