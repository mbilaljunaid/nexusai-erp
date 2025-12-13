import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'wouter';

const processes = [
  { name: 'Procure-to-Pay', href: '/public/processes/procure-to-pay' },
  { name: 'Order-to-Cash', href: '/public/processes/order-to-cash' },
  { name: 'Hire-to-Retire', href: '/public/processes/hire-to-retire' },
  { name: 'Month-End Consolidation', href: '/public/processes/month-end-consolidation' },
  { name: 'Compliance & Risk', href: '/public/processes/compliance-risk' },
  { name: 'Inventory Management', href: '/public/processes/inventory-management' },
  { name: 'Fixed Asset Lifecycle', href: '/public/processes/fixed-asset-lifecycle' },
  { name: 'Production Planning', href: '/public/processes/production-planning' },
  { name: 'Material Requirements Planning', href: '/public/processes/mrp' },
  { name: 'Quality Assurance', href: '/public/processes/quality-assurance' },
  { name: 'Contract Management', href: '/public/processes/contract-management' },
  { name: 'Budget Planning', href: '/public/processes/budget-planning' },
  { name: 'Demand Planning', href: '/public/processes/demand-planning' },
  { name: 'Capacity Planning', href: '/public/processes/capacity-planning' },
  { name: 'Warehouse Management', href: '/public/processes/warehouse-management' },
  { name: 'Customer Returns & RMA', href: '/public/processes/customer-returns' },
  { name: 'Vendor Performance', href: '/public/processes/vendor-performance' },
  { name: 'Subscription Billing', href: '/public/processes/subscription-billing' }
];

export function Footer() {
  const [isProcessesOpen, setIsProcessesOpen] = useState(false);

  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-100 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">NexusAI</h3>
            <p className="text-sm text-slate-300">Enterprise resource planning platform designed for modern businesses</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/use-cases">Use Cases</Link></li>
              <li><Link href="/industries">Industries</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/demo">Demo</Link></li>
              <li><Link href="/login">Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Email: info@nexusaifirst.cloud</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Support: support@nexusaifirst.cloud</li>
            </ul>
          </div>
        </div>

        {/* Process Flows - Collapsible */}
        <div className="border-t border-slate-800 pt-8">
          <button
            onClick={() => setIsProcessesOpen(!isProcessesOpen)}
            className="flex items-center gap-2 mb-4 text-white font-semibold hover:text-blue-400 transition-colors"
            data-testid="button-processes-toggle"
          >
            <span>Process Flows (18 Processes)</span>
            <ChevronDown 
              className={`w-5 h-5 transition-transform ${isProcessesOpen ? 'rotate-180' : ''}`}
              data-testid="icon-chevron-processes"
            />
          </button>

          {isProcessesOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processes.map((process) => (
                <Link 
                  key={process.href} 
                  href={process.href}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  data-testid={`link-process-${process.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="text-blue-500">→</span> {process.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; 2025 NexusAI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
