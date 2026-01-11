import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Compass, BookOpen, Code2, Zap, Users, ShoppingBag, Briefcase, Heart, Video, FileCode2, FileText, FolderOpen } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Cash Management", path: "/finance/cash-management" },
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
              NexusAIFirst
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
                  className={`text-sm font-medium transition-colors cursor-pointer ${isActive(item.path)
                    ? "text-blue-400"
                    : "text-slate-300 hover:text-white"
                    }`}
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Marketplace Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMarketplaceOpen(true)}
              onMouseLeave={() => setMarketplaceOpen(false)}
            >
              <button
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1 py-2"
                onClick={() => setMarketplaceOpen(!marketplaceOpen)}
                data-testid="button-marketplace-menu"
              >
                Marketplace
                <ChevronDown className={`w-4 h-4 transition-transform ${marketplaceOpen ? 'rotate-180' : ''}`} />
              </button>

              {marketplaceOpen && (
                <div className="absolute left-0 top-full pt-1 w-64">
                  <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2">
                    <Link to="/marketplace/services" className="block" data-testid="link-marketplace-services">
                      <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Service Marketplace</div>
                          <div className="text-xs text-slate-400">Expert consulting & services</div>
                        </div>
                      </div>
                    </Link>
                    <Link to="/marketplace/apps" className="block" data-testid="link-marketplace-apps">
                      <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">App Marketplace</div>
                          <div className="text-xs text-slate-400">Extensions & integrations</div>
                        </div>
                      </div>
                    </Link>
                    <Link to="/marketplace/jobs" className="block" data-testid="link-marketplace-jobs">
                      <div className="px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Job Board</div>
                          <div className="text-xs text-slate-400">Find work or hire experts</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Community Link */}
            <Link to="/community">
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${isActive("/community")
                  ? "text-blue-400"
                  : "text-slate-300 hover:text-white"
                  }`}
                data-testid="link-nav-community"
              >
                Community
              </span>
            </Link>

            {/* Highlighted Contribution Link */}
            <Link to="/contribution">
              <span
                className="text-sm font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all cursor-pointer flex items-center gap-1.5"
                data-testid="link-nav-contribution"
              >
                <Heart className="w-4 h-4" />
                Contribute
              </span>
            </Link>

            {/* Documentation Menu */}
            <div
              className="relative"
              onMouseEnter={() => setDocsOpen(true)}
              onMouseLeave={() => setDocsOpen(false)}
            >
              <button
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1 py-2"
                onClick={() => setDocsOpen(!docsOpen)}
                data-testid="button-documentation-menu"
              >
                Documentation
                <ChevronDown className={`w-4 h-4 transition-transform ${docsOpen ? 'rotate-180' : ''}`} />
              </button>

              {docsOpen && (
                <div
                  className="absolute left-0 top-full pt-1 w-72"
                >
                  <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2">
                    <p className="px-4 py-1 text-[10px] text-slate-500 uppercase tracking-wider">Official Documentation</p>

                    <Link to="/docs/process-flows" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <Compass className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Process Flows</div>
                          <div className="text-xs text-slate-400">All 18 end-to-end business processes</div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/docs/implementation" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Implementation Playbooks</div>
                          <div className="text-xs text-slate-400">Go-live preparation & best practices</div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/docs/technical" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <Code2 className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Technical Reference</div>
                          <div className="text-xs text-slate-400">API specs & developer documentation</div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/docs/governance" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Governance Policies</div>
                          <div className="text-xs text-slate-400">Compliance & security standards</div>
                        </div>
                      </div>
                    </Link>

                    <div className="border-t border-slate-600 mt-1 pt-1">
                      <p className="px-4 py-1 text-[10px] text-slate-500 uppercase tracking-wider">Community Academy</p>
                    </div>

                    <Link to="/training/videos" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <Video className="w-4 h-4 text-red-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Video Tutorials</div>
                          <div className="text-xs text-slate-400">Community-contributed video guides</div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/training/apis" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <FileCode2 className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">API & Integrations</div>
                          <div className="text-xs text-slate-400">Sample code & integration guides</div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/training/guides" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <FileText className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">User Guides</div>
                          <div className="text-xs text-slate-400">Step-by-step how-to tutorials</div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/training/materials" className="block">
                      <div className="px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-semibold text-sm text-slate-100">Training Materials</div>
                          <div className="text-xs text-slate-400">Courses & learning paths</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA & Mobile Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
              className="md:hidden p-2 hover:bg-slate-800 rounded text-white border border-slate-600"
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                  className={`block w-full text-left px-4 py-2 rounded text-sm ${isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                    }`}
                  data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
            {/* Mobile Contribution Link - Highlighted */}
            <Link to="/contribution">
              <button
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2 rounded text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium"
                data-testid="link-mobile-contribution"
              >
                Contribute
              </button>
            </Link>
            {/* Mobile Marketplace */}
            <div className="border-t border-slate-700 pt-2 mt-2 space-y-2">
              <p className="px-4 text-xs text-slate-500 uppercase">Marketplace</p>
              <Link to="/marketplace/services">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800" data-testid="link-mobile-marketplace-services">
                  Service Marketplace
                </button>
              </Link>
              <Link to="/marketplace/apps">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800" data-testid="link-mobile-marketplace-apps">
                  App Marketplace
                </button>
              </Link>
            </div>
            {/* Mobile Community */}
            <Link to="/community">
              <button
                onClick={() => setMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 rounded text-sm ${isActive("/community")
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
                  }`}
                data-testid="link-mobile-community"
              >
                Community
              </button>
            </Link>
            {/* Mobile Documentation */}
            <div className="border-t border-slate-700 pt-2 mt-2 space-y-2">
              <p className="px-4 text-xs text-slate-500 uppercase">Documentation</p>
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
              <p className="px-4 pt-2 text-xs text-slate-500 uppercase">Community Content</p>
              <Link to="/training/videos">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  Training Videos
                </button>
              </Link>
              <Link to="/training/apis">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  APIs & Integrations
                </button>
              </Link>
              <Link to="/training/guides">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  User Guides
                </button>
              </Link>
              <Link to="/training/materials">
                <button onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-800">
                  Training Materials
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
              NexusAIFirst
            </h3>
            <p className="text-slate-400 text-sm">
              Transform your enterprise with AI-powered ERP solutions for 41+ industries.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/features" className="hover:text-white transition" data-testid="link-footer-features">Features</Link></li>
              <li><Link to="/use-cases" className="hover:text-white transition" data-testid="link-footer-usecases">Use Cases</Link></li>
              <li><Link to="/industries" className="hover:text-white transition" data-testid="link-footer-industries">Industries</Link></li>
              <li><Link to="/modules" className="hover:text-white transition" data-testid="link-footer-modules">Modules</Link></li>
              <li><Link to="/marketplace" className="hover:text-white transition" data-testid="link-footer-marketplace">Marketplace</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition" data-testid="link-footer-pricing">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/blog" className="hover:text-white transition" data-testid="link-footer-blog">Blog</Link></li>
              <li><Link to="/contribution" className="hover:text-white transition" data-testid="link-footer-contribution">Contribute</Link></li>
              <li><Link to="/community" className="hover:text-white transition" data-testid="link-footer-community">Community</Link></li>
              <li><Link to="/docs/process-flows" className="hover:text-white transition">Process Flows</Link></li>
              <li><Link to="/docs/training-guides" className="hover:text-white transition">Training Guides</Link></li>
              <li><Link to="/docs/technical" className="hover:text-white transition">Technical Docs</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition" data-testid="link-footer-about">About</Link></li>
              <li><Link to="/partners" className="hover:text-white transition" data-testid="link-footer-partners">Partners</Link></li>
              <li><Link to="/careers" className="hover:text-white transition" data-testid="link-footer-careers">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-white transition" data-testid="link-footer-contact">Contact</Link></li>
              <li><Link to="/legal" className="hover:text-white transition" data-testid="link-footer-legal">Legal</Link></li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h4 className="text-white font-semibold mb-4">Open Source</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" data-testid="link-footer-github">GitHub</a></li>
              <li><Link to="/open-source" className="hover:text-white transition" data-testid="link-footer-opensource">About Open Source</Link></li>
              <li><Link to="/license" className="hover:text-white transition" data-testid="link-footer-license">License (AGPL-3.0)</Link></li>
              <li><Link to="/docs/contributing" className="hover:text-white transition" data-testid="link-footer-contributing">Contributing</Link></li>
              <li><Link to="/security" className="hover:text-white transition" data-testid="link-footer-security">Security Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>&copy; 2025 NexusAIFirst Contributors. Licensed under AGPL-3.0.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/security" className="hover:text-white transition">Security</Link>
            <Link to="/license" className="hover:text-white transition">License</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
