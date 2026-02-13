import React, { useState } from 'react';
import { Package, ToggleLeft, ToggleRight, DollarSign, Grid3x3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/admin/AdminLayout';

interface Module {
    id: string;
    name: string;
    slug: string;
    category: string;
    enabled: boolean;
    features: string[];
    industries: string[];
    pricing: string;
}

export default function ModuleManagement() {
    const [modules, setModules] = useState<Module[]>([
        {
            id: '1',
            name: 'Finance & Accounting',
            slug: 'finance',
            category: 'Core ERP',
            enabled: true,
            features: ['GL', 'AP', 'AR', 'Cash', 'Fixed Assets', 'Expense', 'Revenue', 'Reporting'],
            industries: ['Manufacturing', 'SaaS', 'Retail', 'Healthcare'],
            pricing: 'Included'
        },
        {
            id: '2',
            name: 'Human Resources',
            slug: 'hr',
            category: 'Core ERP',
            enabled: true,
            features: ['Core HR', 'Payroll', 'Time', 'Benefits', 'Talent', 'Recruitment', 'Learning', 'Compensation'],
            industries: ['Manufacturing', 'Healthcare', 'Retail', 'Technology'],
            pricing: 'Per Employee'
        },
        {
            id: '3',
            name: 'CRM & Sales',
            slug: 'crm',
            category: 'Core ERP',
            enabled: true,
            features: ['Sales CRM', 'Leads', 'Opportunities', 'Accounts', 'Contacts', 'Quotes', 'Orders', 'Portal'],
            industries: ['SaaS', 'Manufacturing', 'Professional Services'],
            pricing: 'Per User'
        },
    ]);

    const toggleModule = (id: string) => {
        setModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Module Management</h1>
                        <p className="text-muted-foreground">Configure available modules and their settings</p>
                    </div>
                    <Button>
                        <Package className="w-4 h-4 mr-2" />
                        Add Module
                    </Button>
                </div>

                {/* Modules List */}
                <div className="space-y-4">
                    {modules.map((module) => (
                        <Card key={module.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Package className="w-6 h-6 text-blue-600" />
                                                <div>
                                                    <h3 className="text-lg font-semibold">{module.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{module.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={module.enabled}
                                                    onCheckedChange={() => toggleModule(module.id)}
                                                />
                                                <span className="text-sm font-medium">
                                                    {module.enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Category & Pricing */}
                                        <div className="flex items-center gap-4">
                                            <Badge>{module.category}</Badge>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <DollarSign className="w-4 h-4" />
                                                <span>{module.pricing}</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div>
                                            <div className="text-sm font-medium mb-2">Features ({module.features.length})</div>
                                            <div className="flex flex-wrap gap-2">
                                                {module.features.map((feature) => (
                                                    <Badge key={feature} variant="outline" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Industries */}
                                        <div>
                                            <div className="text-sm font-medium mb-2">Industries ({module.industries.length})</div>
                                            <div className="flex flex-wrap gap-2">
                                                {module.industries.map((industry) => (
                                                    <Badge key={industry} variant="secondary" className="text-xs">
                                                        {industry}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <Button variant="outline" size="sm">
                                                <Grid3x3 className="w-4 h-4 mr-2" />
                                                Configure
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                Industry Mapping
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                Pricing
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
