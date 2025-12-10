import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Compass, BookOpen, Code2, Zap } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Use Cases", path: "/use-cases" },
    { label: "Industries", path: "/industries" },
    { label: "About", path: "/about" },
    { label: "Blog", path: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer" data-testid="link-logo">
              NexusAI
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
              >
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isActive(item.path)
                      ? "text-blue-400"
                      : "text-slate-300 hover:text-white"
                  }`}
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Documentation Menu */}
            <div className="relative group">
              <button
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                onMouseEnter={() => setDocsOpen(true)}
                onMouseLeave={() => setDocsOpen(false)}
                data-testid="button-documentation-menu"
              >
                Documentation
                <ChevronDown className="w-4 h-4" />
              </button>

              {docsOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2"
                  onMouseEnter={() => setDocsOpen(true)}
                  onMouseLeave={() => setDocsOpen(false)}
                >
                  <Link to="/docs/process-flows" className="block">
                    <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                      <Compass className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold text-sm text-slate-100">Process Flows</div>
                        <div className="text-xs text-slate-400">All 18 end-to-end processes</div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/docs/training-guides" className="block">
                    <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="font-semibold text-sm text-slate-100">Training Guides</div>
                        <div className="text-xs text-slate-400">Module training materials</div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/docs/technical" className="block">
                    <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                      <Code2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-semibold text-sm text-slate-100">Technical Docs</div>
                        <div className="text-xs text-slate-400">API & developer guides</div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/docs/implementation" className="block">
                    <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="font-semibold text-sm text-slate-100">Implementation</div>
                        <div className="text-xs text-slate-400">Go-live preparation</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* CTA & Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="hidden md:flex text-white border-slate-600 hover:bg-slate-800" size="sm" data-testid="button-header-login">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700" size="sm" data-testid="button-header-signup">
                Sign Up
              </Button>
            </Link>
            <Link to="/demo">
              <Button className="hidden md:flex bg-slate-700 hover:bg-slate-600" size="sm" data-testid="button-header-demo">
                Demo
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded"
              data-testid="button-mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
              >
                <button
                  onClick={() => setMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2 rounded text-sm ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                  data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
            <div className="border-t border-slate-700 pt-2 mt-2 space-y-2">
              <Link to="/docs/process-flows">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  Process Flows
                </button>
              </Link>
              <Link to="/docs/training-guides">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  Training Guides
                </button>
              </Link>
              <Link to="/docs/technical">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  Technical Docs
                </button>
              </Link>
              <Link to="/docs/implementation">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  Implementation
                </button>
              </Link>
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full text-white border-slate-600 hover:bg-slate-800" data-testid="button-mobile-login">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-mobile-signup">
                Sign Up
              </Button>
            </Link>
            <Link to="/demo">
              <Button className="w-full bg-slate-700 hover:bg-slate-600" data-testid="button-mobile-demo">
                Demo
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              NexusAI
            </h3>
            <p className="text-slate-400 text-sm">
              Transform your enterprise with AI-powered ERP solutions for 41+ industries.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/use-cases" className="hover:text-white transition" data-testid="link-footer-usecases">Use Cases</Link></li>
              <li><Link to="/industries" className="hover:text-white transition" data-testid="link-footer-industries">Industries</Link></li>
              <li><a href="#" className="hover:text-white transition">Modules</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/blog" className="hover:text-white transition" data-testid="link-footer-blog">Blog</Link></li>
              <li><Link to="/docs/process-flows" className="hover:text-white transition">Process Flows</Link></li>
              <li><Link to="/docs/training-guides" className="hover:text-white transition">Training Guides</Link></li>
              <li><Link to="/docs/technical" className="hover:text-white transition">Technical Docs</Link></li>
              <li><Link to="/docs/implementation" className="hover:text-white transition">Implementation</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition" data-testid="link-footer-about">About</Link></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Legal</a></li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h4 className="text-white font-semibold mb-4">Open Source</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="https://github.com/nexusai/nexusai-erp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" data-testid="link-footer-github">GitHub</a></li>
              <li><Link to="/open-source" className="hover:text-white transition" data-testid="link-footer-opensource">About Open Source</Link></li>
              <li><Link to="/license" className="hover:text-white transition" data-testid="link-footer-license">License (AGPL-3.0)</Link></li>
              <li><Link to="/docs/contributing" className="hover:text-white transition" data-testid="link-footer-contributing">Contributing</Link></li>
              <li><Link to="/security" className="hover:text-white transition" data-testid="link-footer-security">Security Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>&copy; 2025 NexusAI Contributors. Licensed under AGPL-3.0.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <Link to="/security" className="hover:text-white transition">Security</Link>
            <Link to="/license" className="hover:text-white transition">License</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
