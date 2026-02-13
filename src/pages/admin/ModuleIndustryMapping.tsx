import React, { useState } from 'react';
import { Map, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/components/admin/AdminLayout';

export default function ModuleIndustryMapping() {
    const modules = [
        'Finance & Accounting',
        'Human Resources',
        'CRM & Sales',
        'Supply Chain',
        'Manufacturing',
        'Projects & Services'
    ];

    const industries = [
        'Manufacturing',
        'SaaS',
        'Retail',
        'Healthcare',
        'Financial Services',
        'Professional Services',
        'Technology',
        'Hospitality'
    ];

    // Mock mapping state - in reality this would come from API
    const [mapping, setMapping] = useState<Record<string, Record<string, boolean>>>({
        'Manufacturing': {
            'Finance & Accounting': true,
            'Human Resources': true,
            'CRM & Sales': true,
            'Supply Chain': true,
            'Manufacturing': true,
            'Projects & Services': false
        },
        'SaaS': {
            'Finance & Accounting': true,
            'Human Resources': true,
            'CRM & Sales': true,
            'Supply Chain': false,
            'Manufacturing': false,
            'Projects & Services': true
        },
        // ... other industries
    });

    const toggleMapping = (industry: string, module: string) => {
        setMapping(prev => ({
            ...prev,
            [industry]: {
                ...prev[industry],
                [module]: !prev[industry]?.[module]
            }
        }));
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Module-Industry Mapping</h1>
                    <p className="text-muted-foreground">Configure which modules are available for each industry</p>
                </div>

                {/* Mapping Matrix */}
                <Card>
                    <CardHeader>
                        <CardTitle>Industry × Module Matrix</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Check modules to enable for each industry. Recommended modules are highlighted.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2">
                                        <th className="text-left py-3 px-4 font-medium bg-gray-50 sticky left-0 z-10">
                                            Industry
                                        </th>
                                        {modules.map((module) => (
                                            <th key={module} className="text-center py-3 px-4 font-medium bg-gray-50 min-w-[120px]">
                                                <div className="text-xs">{module}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {industries.map((industry) => (
                                        <tr key={industry} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium bg-white sticky left-0 z-10">
                                                {industry}
                                            </td>
                                            {modules.map((module) => (
                                                <td key={module} className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={mapping[industry]?.[module] || false}
                                                            onCheckedChange={() => toggleMapping(industry, module)}
                                                        />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                            <Button variant="outline" size="sm">
                                <Check className="w-4 h-4 mr-2" />
                                Enable All
                            </Button>
                            <Button variant="outline" size="sm">
                                <X className="w-4 h-4 mr-2" />
                                Disable All
                            </Button>
                            <Button size="sm" className="ml-auto">
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Industry Templates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Industry Templates</CardTitle>
                        <p className="text-sm text-muted-foreground">Pre-configured module bundles for common industries</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                                <div className="font-medium mb-1">Manufacturing Full Suite</div>
                                <div className="text-xs text-muted-foreground">
                                    Finance, HR, CRM, SCM, Manufacturing, Projects
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                                <div className="font-medium mb-1">SaaS Starter</div>
                                <div className="text-xs text-muted-foreground">
                                    Finance, HR, CRM, Projects
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                                <div className="font-medium mb-1">Retail Essential</div>
                                <div className="text-xs text-muted-foreground">
                                    Finance, HR, CRM, SCM
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
