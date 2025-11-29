import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Bell, 
  Shield, 
  Sparkles, 
  Palette,
  Save,
  Mail
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    aiInsights: true,
    taskReminders: true,
    leadAlerts: true,
  });

  const [aiSettings, setAiSettings] = useState({
    autoScoring: true,
    taskSuggestions: true,
    emailDrafts: true,
    analyticsInsights: true,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" data-testid="input-first-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" data-testid="input-last-name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@company.com" data-testid="input-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="admin">
                  <SelectTrigger data-testid="select-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button data-testid="button-save-profile">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" data-testid="input-current-password" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" data-testid="input-new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" data-testid="input-confirm-password" />
                </div>
              </div>
              <Button variant="outline" data-testid="button-change-password">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label>Email Notifications</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Receive email updates</p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label>Push Notifications</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  data-testid="switch-push-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label>AI Insights</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Get notified about AI recommendations</p>
                </div>
                <Switch 
                  checked={notifications.aiInsights}
                  onCheckedChange={(checked) => setNotifications({...notifications, aiInsights: checked})}
                  data-testid="switch-ai-insights"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Reminders</Label>
                  <p className="text-xs text-muted-foreground">Reminders for upcoming tasks</p>
                </div>
                <Switch 
                  checked={notifications.taskReminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, taskReminders: checked})}
                  data-testid="switch-task-reminders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lead Alerts</Label>
                  <p className="text-xs text-muted-foreground">Alerts for hot leads and important updates</p>
                </div>
                <Switch 
                  checked={notifications.leadAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, leadAlerts: checked})}
                  data-testid="switch-lead-alerts"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Features
              </CardTitle>
              <CardDescription>Configure AI-powered features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Lead Scoring</Label>
                  <p className="text-xs text-muted-foreground">AI automatically scores new leads</p>
                </div>
                <Switch 
                  checked={aiSettings.autoScoring}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, autoScoring: checked})}
                  data-testid="switch-auto-scoring"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Suggestions</Label>
                  <p className="text-xs text-muted-foreground">AI suggests tasks based on your activity</p>
                </div>
                <Switch 
                  checked={aiSettings.taskSuggestions}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, taskSuggestions: checked})}
                  data-testid="switch-task-suggestions"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Draft Generation</Label>
                  <p className="text-xs text-muted-foreground">AI helps draft follow-up emails</p>
                </div>
                <Switch 
                  checked={aiSettings.emailDrafts}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, emailDrafts: checked})}
                  data-testid="switch-email-drafts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics Insights</Label>
                  <p className="text-xs text-muted-foreground">AI-powered analytics and predictions</p>
                </div>
                <Switch 
                  checked={aiSettings.analyticsInsights}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, analyticsInsights: checked})}
                  data-testid="switch-analytics-insights"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Model</CardTitle>
              <CardDescription>AI model configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">GPT-4o</p>
                    <p className="text-xs text-muted-foreground">Powered by OpenAI via Replit AI Integrations</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">Active</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI features are powered by Replit AI Integrations. Usage is billed to your Replit credits.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>Customize the appearance of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className={`p-4 rounded-md border-2 cursor-pointer hover-elevate ${theme === 'light' ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setTheme('light')}
                  data-testid="button-theme-light"
                >
                  <div className="h-20 rounded bg-white border mb-2" />
                  <p className="text-sm font-medium text-center">Light</p>
                </div>
                <div 
                  className={`p-4 rounded-md border-2 cursor-pointer hover-elevate ${theme === 'dark' ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setTheme('dark')}
                  data-testid="button-theme-dark"
                >
                  <div className="h-20 rounded bg-gray-900 border border-gray-700 mb-2" />
                  <p className="text-sm font-medium text-center">Dark</p>
                </div>
                <div 
                  className={`p-4 rounded-md border-2 cursor-pointer hover-elevate ${theme === 'system' ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setTheme('system')}
                  data-testid="button-theme-system"
                >
                  <div className="h-20 rounded bg-gradient-to-r from-white to-gray-900 border mb-2" />
                  <p className="text-sm font-medium text-center">System</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
