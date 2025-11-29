import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export function LeaveRequestForm() {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    days: "",
    reason: "",
    approver: "",
    replacement: "",
  });

  const leaveTypes = [
    { value: "annual", label: "Annual Leave", balance: 15 },
    { value: "sick", label: "Sick Leave", balance: 10 },
    { value: "personal", label: "Personal Leave", balance: 5 },
    { value: "maternity", label: "Maternity Leave", balance: 90 },
    { value: "unpaid", label: "Unpaid Leave", balance: "Unlimited" },
  ];

  const selectedType = leaveTypes.find(t => t.value === formData.leaveType);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days;
    }
    return 0;
  };

  const days = calculateDays();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Leave Request
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Apply for time off</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Leave Type *</Label>
              <Select value={formData.leaveType} onValueChange={(v) => handleChange("leaveType", v)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedType && (
              <div className="space-y-2">
                <Label>Available Balance</Label>
                <div className="p-2 bg-muted rounded">
                  <p className="text-sm font-semibold">{selectedType.balance} {typeof selectedType.balance === "number" ? "days" : ""}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date *</Label>
              <Input
                id="start"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date *</Label>
              <Input
                id="end"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Number of Days</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-lg font-semibold">{days} working day{days !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Provide reason for leave"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="approver">Manager/Approver *</Label>
              <Select value={formData.approver} onValueChange={(v) => handleChange("approver", v)}>
                <SelectTrigger id="approver">
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mgr1">John Manager</SelectItem>
                  <SelectItem value="mgr2">Jane Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="replace">Coverage/Replacement</Label>
              <Select value={formData.replacement} onValueChange={(v) => handleChange("replacement", v)}>
                <SelectTrigger id="replace">
                  <SelectValue placeholder="Select replacement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp1">Team Member 1</SelectItem>
                  <SelectItem value="emp2">Team Member 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-info/10 p-4 rounded-md border border-info/20">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> Ensure adequate coverage is arranged before approval. Your manager will review and approve this request.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Submit Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
