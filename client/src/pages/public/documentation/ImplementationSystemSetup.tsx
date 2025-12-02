import { Card } from '@/components/ui/card';
import { Zap, CheckCircle } from 'lucide-react';

export default function ImplementationSystemSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-900 dark:to-orange-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8" />
            <h1 className="text-4xl font-bold">System Setup Guide</h1>
          </div>
          <p className="text-orange-100 text-lg">Initial configuration and setup for NexusAI ERP implementation</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="p-8 mb-8 bg-orange-50 dark:bg-orange-950">
          <h2 className="text-2xl font-bold text-foreground mb-4">Pre-Implementation Requirements</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="text-muted-foreground">Server infrastructure and database setup</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="text-muted-foreground">Network connectivity and security configuration</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="text-muted-foreground">User accounts and role definitions</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="text-muted-foreground">Master data preparation</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-3">Step 1: Infrastructure</h3>
            <p className="text-sm text-muted-foreground">Provision servers, configure databases, and set up networking infrastructure.</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-3">Step 2: Configuration</h3>
            <p className="text-sm text-muted-foreground">Configure system settings, company parameters, and security policies.</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-3">Step 3: Validation</h3>
            <p className="text-sm text-muted-foreground">Test system functionality and validate configuration.</p>
          </Card>
        </div>

        <Card className="p-8">
          <h3 className="font-bold text-2xl text-foreground mb-4">Configuration Steps</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-foreground mb-1">Configure Company Master</h4>
              <p>Define company name, legal entity structure, and basic parameters</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-foreground mb-1">Setup Chart of Accounts</h4>
              <p>Configure GL account structure with company-specific accounts</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-foreground mb-1">Define Users and Roles</h4>
              <p>Create users, assign roles, and configure access permissions</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-foreground mb-1">Import Master Data</h4>
              <p>Load customers, vendors, items, and employees from legacy systems</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
