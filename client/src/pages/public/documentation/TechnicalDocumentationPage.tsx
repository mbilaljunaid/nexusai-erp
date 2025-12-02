import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { ArrowRight, Code2 } from 'lucide-react';

const docs = [
  { name: 'API Reference', slug: 'api-reference', description: 'Complete REST API documentation' },
  { name: 'Database Schema', slug: 'database-schema', description: 'Database structure and relationships' },
  { name: 'Authentication & Security', slug: 'authentication-security', description: 'Authentication methods and security protocols' },
  { name: 'Workflow Engine', slug: 'workflow-engine', description: 'Workflow automation and business rules' },
  { name: 'GL Integration', slug: 'gl-integration', description: 'General Ledger posting and reconciliation' },
  { name: 'Data Migration', slug: 'data-migration', description: 'Data import, export, and transformation' },
  { name: 'Integration Guide', slug: 'integration-guide', description: 'Third-party integrations and APIs' },
  { name: 'Mobile Sync', slug: 'mobile-sync', description: 'Mobile application synchronization' },
  { name: 'Analytics Engine', slug: 'analytics-engine', description: 'Analytics and reporting engine' },
  { name: 'Deployment Guide', slug: 'deployment-guide', description: 'System deployment and infrastructure' },
  { name: 'Performance Tuning', slug: 'performance-tuning', description: 'Optimization and performance best practices' },
  { name: 'Troubleshooting', slug: 'troubleshooting', description: 'Common issues and solutions' }
];

export function TechnicalDocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-900 dark:to-purple-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Technical Documentation</h1>
          </div>
          <p className="text-purple-100 text-lg">Developer guides and API reference</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <Link key={doc.slug} href={`/docs/technical/${doc.slug}`}>
              <Card className="p-6 hover:shadow-lg hover:border-purple-500 transition-all cursor-pointer h-full">
                <h3 className="text-lg font-bold text-foreground mb-2">{doc.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm">
                  Read Docs <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
