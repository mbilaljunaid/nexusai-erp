import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Mail, Users, Send, Settings, Zap, Trash2 } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Email() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("inbox");
  const [newTemplate, setNewTemplate] = useState({ name: "", category: "general", subject: "" });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/email-templates"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/email-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setNewTemplate({ name: "", category: "general", subject: "" });
      toast({ title: "Email template created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/email-templates/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Template deleted" });
    }
  });

  const navItems = [
    { id: "inbox", label: "Inbox", icon: Mail, color: "text-blue-500" }
    { id: "accounts", label: "Accounts", icon: Users, color: "text-purple-500" }
    { id: "campaigns", label: "Campaigns", icon: Send, color: "text-green-500" }
    { id: "templates", label: "Templates", icon: Settings, color: "text-orange-500" }
    { id: "automation", label: "Automation", icon: Zap, color: "text-red-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2"><Mail className="h-8 w-8" />Email Management</h1>
          <p className="text-muted-foreground text-sm">Unified email, team collaboration, and marketing campaigns</p>
        </div>
        <Button data-testid="button-compose-email">
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "inbox" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">842</p><p className="text-xs text-muted-foreground">Unread Emails</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">15</p><p className="text-xs text-muted-foreground">Team Members</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">28</p><p className="text-xs text-muted-foreground">Email Accounts</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">2.4h</p><p className="text-xs text-muted-foreground">Avg Response Time</p></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Email Management Capabilities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Unified Inbox", description: "Manage all emails in one place" }
                  { name: "Team Collaboration", description: "Assign, comment, and share emails" }
                  { name: "CRM Integration", description: "Link emails to contacts and deals" }
                  { name: "Email Tracking", description: "Track opens, clicks, and replies" }
                  { name: "Templates", description: "Save and reuse email templates" }
                  { name: "Automation", description: "Auto-responders and workflows" }
                ].map((capability) => (
                  <Button key={capability.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{capability.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{capability.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "accounts" && (
        <Card><CardHeader><CardTitle className="text-base">Email Accounts</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Email accounts module loading. Connect and manage multiple email addresses and accounts.</p><Button size="sm" className="mt-4">+ Connect Account</Button></CardContent></Card>
      )}

      {activeNav === "campaigns" && (
        <Card><CardHeader><CardTitle className="text-base">Email Campaigns</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Email campaigns module loading. Create and send bulk email campaigns with tracking.</p></CardContent></Card>
      )}

      {activeNav === "templates" && (
        <Card><CardHeader><CardTitle className="text-base">Email Templates</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Templates module loading. Create and manage reusable email templates.</p></CardContent></Card>
      )}

      {activeNav === "automation" && (
        <Card><CardHeader><CardTitle className="text-base">Email Automation</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Automation module loading. Set up automatic workflows and follow-ups.</p></CardContent></Card>
      )}
    </div>
  );
}
