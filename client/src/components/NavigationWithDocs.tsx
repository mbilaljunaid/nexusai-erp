import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronDown, BookOpen, Code2, Zap, Compass } from 'lucide-react';

export function Header() {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
          NexusAI
        </Link>

        {/* Main Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-foreground hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/use-cases" className="text-foreground hover:text-blue-600 transition-colors">Use Cases</Link>
          <Link href="/industries" className="text-foreground hover:text-blue-600 transition-colors">Industries</Link>
          
          {/* Documentation Menu */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 text-foreground hover:text-blue-600 transition-colors"
              onMouseEnter={() => setIsDocsOpen(true)}
              onMouseLeave={() => setIsDocsOpen(false)}
              data-testid="button-documentation-menu"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
              <ChevronDown className={`w-4 h-4 transition-transform ${isDocsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDocsOpen && (
              <div
                className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2"
                onMouseEnter={() => setIsDocsOpen(true)}
                onMouseLeave={() => setIsDocsOpen(false)}
              >
                {/* Process Flows */}
                <Link href="/docs/process-flows" className="block">
                  <div className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 group/item">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">Process Flows</div>
                      <div className="text-xs text-muted-foreground">All 18 end-to-end processes</div>
                    </div>
                  </div>
                </Link>

                {/* Training Guides */}
                <Link href="/docs/training-guides" className="block">
                  <div className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 group/item">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">Training Guides</div>
                      <div className="text-xs text-muted-foreground">Module training materials</div>
                    </div>
                  </div>
                </Link>

                {/* Technical Documentation */}
                <Link href="/docs/technical" className="block">
                  <div className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 group/item">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">Technical Docs</div>
                      <div className="text-xs text-muted-foreground">API & developer guides</div>
                    </div>
                  </div>
                </Link>

                {/* Implementation Guidelines */}
                <Link href="/docs/implementation" className="block">
                  <div className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 group/item">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">Implementation</div>
                      <div className="text-xs text-muted-foreground">Go-live preparation</div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link href="/blog" className="text-foreground hover:text-blue-600 transition-colors">Blog</Link>
          <Link href="/about" className="text-foreground hover:text-blue-600 transition-colors">About</Link>
          <Link href="/login" className="text-foreground hover:text-blue-600 transition-colors">Login</Link>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  const [isProcessesOpen, setIsProcessesOpen] = useState(false);

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
              <li>Email: info@nexusai.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Support: support@nexusai.com</li>
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
