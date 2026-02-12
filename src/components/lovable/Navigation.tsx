import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
    Menu,
    X,
    ChevronDown,
    ArrowRight,
    Github,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { colors, glassmorphism } from '@/lib/design-tokens';
import { animations } from '@/lib/animations';

interface NavLinkProps {
    to: string;
    children: React.ReactNode;
    external?: boolean;
}

function NavLink({ to, children, external }: NavLinkProps) {
    if (external) {
        return (
            <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
            >
                {children}
                <ExternalLink className="w-3 h-3" />
            </a>
        );
    }

    return (
        <Link to={to}>
            <a className="text-sm font-medium hover:text-primary transition-colors">
                {children}
            </a>
        </Link>
    );
}

interface MegaMenuProps {
    title: string;
    items: Array<{ label: string; to: string; description?: string }>;
}

function MegaMenu({ title, items }: MegaMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                {title}
                <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <motion.div
                    className="absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-xl z-50"
                    style={{
                        background: glassmorphism.background,
                        backdropFilter: glassmorphism.backdropFilter,
                        border: glassmorphism.border,
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <div className="p-4 space-y-2">
                        {items.slice(0, 8).map((item, index) => (
                            <Link key={index} to={item.to}>
                                <a className="block p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                    <div className="font-medium text-sm">{item.label}</div>
                                    {item.description && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {item.description}
                                        </div>
                                    )}
                                </a>
                            </Link>
                        ))}
                        {items.length > 8 && (
                            <Link to={`/${title.toLowerCase()}`}>
                                <a className="block p-2 text-sm text-primary hover:underline">
                                    View all {items.length} {title} →
                                </a>
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export function PremiumNav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const industries = [
        { label: 'Healthcare', to: '/industries/healthcare' },
        { label: 'Manufacturing', to: '/industries/manufacturing' },
        { label: 'Retail', to: '/industries/retail' },
        { label: 'SaaS', to: '/industries/saas' },
        { label: 'Banking', to: '/industries/banking' },
        { label: 'Energy', to: '/industries/energy' },
        // More industries...
    ];

    const modules = [
        { label: 'General Ledger', to: '/modules/general-ledger', description: 'Core accounting' },
        { label: 'Accounts Payable', to: '/modules/accounts-payable', description: 'Invoice management' },
        { label: 'Accounts Receivable', to: '/modules/accounts-receivable', description: 'Collections' },
        { label: 'Cash Management', to: '/modules/cash-management', description: 'Treasury operations' },
        { label: 'Core HR', to: '/modules/core-hr', description: 'Employee management' },
        { label: 'CRM', to: '/modules/crm', description: 'Customer relationships' },
        // More modules...
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled ? "py-4 shadow-lg" : "py-6"
            )}
            style={{
                background: scrolled ? glassmorphism.background : 'transparent',
                backdropFilter: scrolled ? glassmorphism.backdropFilter : 'none',
            }}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/">
                        <a className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600" />
                            <span className="font-bold text-xl">NexusAI</span>
                        </a>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        <MegaMenu title="Industries" items={industries} />
                        <MegaMenu title="Modules" items={modules} />
                        <NavLink to="/features">Features</NavLink>
                        <NavLink to="/pricing">Pricing</NavLink>
                        <NavLink to="/docs">Docs</NavLink>
                        <NavLink to="https://github.com/mbilaljunaid/nexusai-erp" external>
                            GitHub
                        </NavLink>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>
                                Get Started
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        className="lg:hidden mt-4 p-4 rounded-xl border"
                        style={{
                            background: glassmorphism.background,
                            backdropFilter: glassmorphism.backdropFilter,
                        }}
                        {...animations.fadeInDown}
                    >
                        <div className="space-y-4">
                            <Link to="/industries">
                                <a className="block py-2 font-medium">Industries</a>
                            </Link>
                            <Link to="/modules">
                                <a className="block py-2 font-medium">Modules</a>
                            </Link>
                            <Link to="/features">
                                <a className="block py-2 font-medium">Features</a>
                            </Link>
                            <Link to="/pricing">
                                <a className="block py-2 font-medium">Pricing</a>
                            </Link>
                            <Link to="/docs">
                                <a className="block py-2 font-medium">Docs</a>
                            </Link>
                            <div className="pt-4 border-t space-y-2">
                                <Link to="/login">
                                    <Button variant="outline" className="w-full">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
}
