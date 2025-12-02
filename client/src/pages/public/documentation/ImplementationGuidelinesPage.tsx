import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { ArrowRight, Zap } from 'lucide-react';
import { Header, Footer } from "@/components/Navigation";

const guides = [
  { name: 'Pre-Implementation Checklist', slug: 'pre-implementation', description: 'Requirements and preparation' },
  { name: 'System Setup', slug: 'system-setup', description: 'Initial system configuration' },
  { name: 'User Configuration', slug: 'user-configuration', description: 'User roles and permissions setup' },
  { name: 'Chart of Accounts Setup', slug: 'chart-of-accounts', description: 'GL account configuration' },
  { name: 'Master Data Migration', slug: 'master-data-migration', description: 'Importing customer, vendor, item data' },
  { name: 'Process Configuration', slug: 'process-configuration', description: 'Configuring business processes' },
  { name: 'Custom Fields Setup', slug: 'custom-fields', description: 'Adding custom fields to forms' },
  { name: 'Report Customization', slug: 'report-customization', description: 'Creating custom reports' },
  { name: 'Workflow Automation', slug: 'workflow-automation', description: 'Setting up approval workflows' },
  { name: 'Integration Setup', slug: 'integration-setup', description: 'Connecting external systems' },
  { name: 'Testing & Validation', slug: 'testing-validation', description: 'UAT and system testing' },
  { name: 'Go-Live Preparation', slug: 'go-live-preparation', description: 'Final preparations for production' },
  { name: 'Training Program', slug: 'training-program', description: 'User training execution' },
  { name: 'Post-Go-Live', slug: 'post-go-live', description: 'Support and stabilization' }
];

export default function ImplementationGuidelinesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-900 dark:to-orange-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Implementation Guidelines</h1>
          </div>
          <p className="text-orange-100 text-lg">Step-by-step guide for successful ERP implementation</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/docs/implementation/${guide.slug}`}>
              <Card className="p-6 hover:shadow-lg hover:border-orange-500 transition-all cursor-pointer h-full">
                <h3 className="text-lg font-bold text-foreground mb-2">{guide.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
                  View Guide <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
