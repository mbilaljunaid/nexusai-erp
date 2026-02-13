import React, { useState, useEffect } from 'react';
import { Settings, Globe, Bell, Mail, Key, Database, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { useFeatureFlags, useToggleFeatureFlag, useSystemConfig, useUpdateSystemConfig } from '@/hooks/admin/useAdminData';
import { toast } from 'sonner';

export default function SystemConfiguration() {
    // Feature Flags
    const { data: featureFlags = [], isLoading, error } = useFeatureFlags();
    const toggleMutation = useToggleFeatureFlag();

    // General Configuration
    const { data: generalConfig, isLoading: configLoading } = useSystemConfig('general');
    const updateConfigMutation = useUpdateSystemConfig();

    // Form State
    const [formData, setFormData] = useState({
        platformName: '',
        supportEmail: '',
        defaultTimezone: 'UTC',
        defaultCurrency: 'USD',
        maintenanceMode: false,
    });

    // Populate form when data loads
    useEffect(() => {
        if (generalConfig && Array.isArray(generalConfig)) {
            const configMap = generalConfig.reduce((acc: any, item: any) => {
                acc[item.key] = item.value;
                return acc;
            }, {});

            setFormData({
                platformName: configMap.platform_name || 'NexusAI ERP',
                supportEmail: configMap.support_email || 'support@nexusai.com',
                defaultTimezone: configMap.default_timezone || 'UTC',
                defaultCurrency: configMap.default_currency || 'USD',
                maintenanceMode: configMap.maintenance_mode === 'true' || configMap.maintenance_mode === true,
            });
        }
    }, [generalConfig]);

    const handleToggle = async (flagName: string, currentStatus: boolean) => {
        await toggleMutation.mutateAsync({ name: flagName, enabled: !currentStatus });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveGeneral = async () => {
        // Validation
        if (!formData.platformName || formData.platformName.trim().length < 3) {
            toast.error('Platform name must be at least 3 characters');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.supportEmail || !emailRegex.test(formData.supportEmail)) {
            toast.error('Please enter a valid support email');
            return;
        }

        try {
            // Save all configuration values
            await Promise.all([
                updateConfigMutation.mutateAsync({
                    key: 'platform_name',
                    value: formData.platformName,
                    category: 'general',
                    description: 'Platform display name'
                }),
                updateConfigMutation.mutateAsync({
                    key: 'support_email',
                    value: formData.supportEmail,
                    category: 'general',
                    description: 'Support contact email'
                }),
                updateConfigMutation.mutateAsync({
                    key: 'default_timezone',
                    value: formData.defaultTimezone,
                    category: 'general',
                    description: 'Default timezone for new tenants'
                }),
                updateConfigMutation.mutateAsync({
                    key: 'default_currency',
                    value: formData.defaultCurrency,
                    category: 'general',
                    description: 'Default currency code'
                }),
                updateConfigMutation.mutateAsync({
                    key: 'maintenance_mode',
                    value: formData.maintenanceMode.toString(),
                    category: 'general',
                    description: 'Enable maintenance mode'
                }),
            ]);

            toast.success('Configuration saved successfully');
        } catch (error) {
            toast.error('Failed to save configuration');
        }
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
                                {configLoading ? (
                                    <div className="flex items-center justify-center p-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Platform Name *</label>
                                                <Input
                                                    value={formData.platformName}
                                                    onChange={(e) => handleInputChange('platformName', e.target.value)}
                                                    placeholder="NexusAI ERP"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Support Email *</label>
                                                <Input
                                                    type="email"
                                                    value={formData.supportEmail}
                                                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                                                    placeholder="support@nexusai.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Default Timezone</label>
                                                <Select
                                                    value={formData.defaultTimezone}
                                                    onValueChange={(value) => handleInputChange('defaultTimezone', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select timezone" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UTC">UTC</SelectItem>
                                                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                                                        <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Default Currency</label>
                                                <Select
                                                    value={formData.defaultCurrency}
                                                    onValueChange={(value) => handleInputChange('defaultCurrency', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                                                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div>
                                                <div className="font-medium">Maintenance Mode</div>
                                                <div className="text-sm text-muted-foreground">Disable platform access for maintenance</div>
                                            </div>
                                            <Switch
                                                checked={formData.maintenanceMode}
                                                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                                            />
                                        </div>
                                        <Button
                                            className="mt-4"
                                            onClick={handleSaveGeneral}
                                            disabled={updateConfigMutation.isPending}
                                        >
                                            {updateConfigMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </>
                                )}
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
