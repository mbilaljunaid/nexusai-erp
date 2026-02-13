import React, { useState } from 'react';
import { Settings, Globe, Bell, Mail, Key, Database, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useFeatureFlags, useToggleFeatureFlag } from '@/hooks/admin/useAdminData';

export default function SystemConfiguration() {
    const { data: featureFlags = [], isLoading, error } = useFeatureFlags();
    const toggleMutation = useToggleFeatureFlag();

    const handleToggle = async (flagName: string, currentStatus: boolean) => {
        await toggleMutation.mutateAsync({ name: flagName, enabled: !currentStatus });
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">System Configuration</h1>
                    <p className="text-muted-foreground">Configure platform-wide settings and integrations</p>
                </div>

                <Tabs defaultValue="general">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="integrations">Integrations</TabsTrigger>
                        <TabsTrigger value="features">Feature Flags</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Platform Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Platform Name</label>
                                        <Input defaultValue="NexusAI ERP" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Support Email</label>
                                        <Input defaultValue="support@nexusai.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Default Timezone</label>
                                        <Input defaultValue="UTC" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Default Currency</label>
                                        <Input defaultValue="USD" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <div className="font-medium">Maintenance Mode</div>
                                        <div className="text-sm text-muted-foreground">Disable platform access for maintenance</div>
                                    </div>
                                    <Switch />
                                </div>
                                <Button className="mt-4">Save Changes</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email Settings */}
                    <TabsContent value="email" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Email Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">SMTP Host</label>
                                        <Input defaultValue="smtp.sendgrid.net" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">SMTP Port</label>
                                        <Input defaultValue="587" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">SMTP Username</label>
                                        <Input defaultValue="apikey" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">SMTP Password</label>
                                        <Input type="password" defaultValue="••••••••" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <Button variant="outline">Test Connection</Button>
                                    <Button>Save Email Settings</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Integrations */}
                    <TabsContent value="integrations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="w-5 h-5" />
                                    Third-Party Integrations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {['Stripe', 'SendGrid', 'AWS S3', 'Twilio'].map((integration) => (
                                    <div key={integration} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-medium">{integration}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {integration === 'Stripe' && 'Payment processing'}
                                                {integration === 'SendGrid' && 'Email delivery'}
                                                {integration === 'AWS S3' && 'File storage'}
                                                {integration === 'Twilio' && 'SMS notifications'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch defaultChecked />
                                            <Button variant="outline" size="sm">Configure</Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Feature Flags */}
                    <TabsContent value="features" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Feature Flags
                                </CardTitle>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Flag
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center p-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="p-6 text-center text-red-600">
                                        Failed to load feature flags. Please try again.
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !error && featureFlags.length === 0 && (
                                    <div className="p-12 text-center">
                                        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-muted-foreground">No feature flags configured</p>
                                    </div>
                                )}

                                {/* Feature Flags List */}
                                {!isLoading && !error && featureFlags.length > 0 && (
                                    <>
                                        {featureFlags.map((feature: any) => (
                                            <div key={feature.name} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{feature.name}</div>
                                                    <div className="text-sm text-muted-foreground">{feature.description || 'No description'}</div>
                                                </div>
                                                <Switch
                                                    checked={feature.enabled}
                                                    onCheckedChange={() => handleToggle(feature.name, feature.enabled)}
                                                    disabled={toggleMutation.isPending}
                                                />
                                            </div>
                                        ))}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
