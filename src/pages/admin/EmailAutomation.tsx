import React from 'react';
import { Mail, Send, Clock, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';

export default function EmailAutomation() {
    const campaigns = [
        { id: '1', name: 'Welcome Series', status: 'active', sent: 1245, opened: 678, clicked: 234 },
        { id: '2', name: 'Trial Expiration Reminder', status: 'active', sent: 89, opened: 56, clicked: 12 },
        { id: '3', name: 'Feature Announcement', status: 'draft', sent: 0, opened: 0, clicked: 0 },
    ];

    const templates = [
        { id: '1', name: 'Welcome Email', category: 'Onboarding', lastModified: '2024-02-12' },
        { id: '2', name: 'Password Reset', category: 'Transactional', lastModified: '2024-02-10' },
        { id: '3', name: 'Monthly Newsletter', category: 'Marketing', lastModified: '2024-02-08' },
    ];

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Email Automation</h1>
                        <p className="text-muted-foreground">Manage email campaigns, templates, and automation workflows</p>
                    </div>
                    <Button>
                        <Send className="w-4 h-4 mr-2" />
                        New Campaign
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">45,234</div>
                                    <div className="text-sm text-muted-foreground">Emails Sent</div>
                                </div>
                                <Send className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">24.5%</div>
                                    <div className="text-sm text-muted-foreground">Open Rate</div>
                                </div>
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">6.8%</div>
                                    <div className="text-sm text-muted-foreground">Click Rate</div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">1.2%</div>
                                    <div className="text-sm text-muted-foreground">Bounce Rate</div>
                                </div>
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="campaigns">
                    <TabsList>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="automation">Automation</TabsTrigger>
                    </TabsList>

                    {/* Campaigns */}
                    <TabsContent value="campaigns" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Campaigns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {campaigns.map((campaign) => (
                                        <div key={campaign.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{campaign.name}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                                        {campaign.status}
                                                    </Badge>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <div className="text-muted-foreground">Sent</div>
                                                    <div className="font-medium">{campaign.sent.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Opened</div>
                                                    <div className="font-medium">
                                                        {campaign.opened.toLocaleString()} ({campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0}%)
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Clicked</div>
                                                    <div className="font-medium">
                                                        {campaign.clicked.toLocaleString()} ({campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : 0}%)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Templates */}
                    <TabsContent value="templates" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Email Templates</CardTitle>
                                    <Button size="sm">
                                        <Mail className="w-4 h-4 mr-2" />
                                        New Template
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {templates.map((template) => (
                                        <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Mail className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{template.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {template.category} • Last modified {new Date(template.lastModified).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">Preview</Button>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Automation */}
                    <TabsContent value="automation">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Automation Workflows</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: 'New User Onboarding', trigger: 'User signup', steps: 5, active: true },
                                        { name: 'Trial Conversion', trigger: 'Trial day 10', steps: 3, active: true },
                                        { name: 'Re-engagement', trigger: '30 days inactive', steps: 4, active: false },
                                    ].map((workflow, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Clock className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{workflow.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Trigger: {workflow.trigger} • {workflow.steps} steps
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={workflow.active ? 'default' : 'secondary'}>
                                                    {workflow.active ? 'Active' : 'Paused'}
                                                </Badge>
                                                <Button variant="outline" size="sm">Configure</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
