import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';

const modules = [
  { name: 'CRM', slug: 'crm', icon: '👥', description: 'Customer Relationship Management' },
  { name: 'Finance', slug: 'finance', icon: '💰', description: 'Financial Management' },
  { name: 'HR', slug: 'hr', icon: '👔', description: 'Human Resources' },
  { name: 'Procurement', slug: 'procurement', icon: '🛒', description: 'Procurement Management' },
  { name: 'Inventory', slug: 'inventory', icon: '📦', description: 'Inventory Management' },
  { name: 'Manufacturing', slug: 'manufacturing', icon: '🏭', description: 'Manufacturing Operations' },
  { name: 'Warehouse', slug: 'warehouse', icon: '🏢', description: 'Warehouse Management' },
  { name: 'Sales', slug: 'sales', icon: '📊', description: 'Sales Management' },
  { name: 'Quality', slug: 'quality', icon: '✅', description: 'Quality Management' },
  { name: 'Projects', slug: 'projects', icon: '📋', description: 'Project Management' },
  { name: 'Analytics', slug: 'analytics', icon: '📈', description: 'Analytics & Reporting' },
  { name: 'Admin', slug: 'admin', icon: '⚙️', description: 'Administration' }
];

export default function TrainingGuidesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-900 dark:to-green-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Training Guides</h1>
          </div>
          <p className="text-green-100 text-lg">Complete training for all ERP modules</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.slug} href={`/docs/training-guides/${module.slug}`}>
              <Card className="p-6 hover:shadow-lg hover:border-green-500 transition-all cursor-pointer h-full">
                <div className="text-4xl mb-3">{module.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  Start Training <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
