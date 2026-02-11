import React from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Activity, FileText, Lock, Database, ChevronRight } from 'lucide-react';

const adminNavItems = [
    { name: 'Health Dashboard', path: '/admin/production/health', icon: Activity },
    { name: 'System Logs', path: '/admin/production/logs', icon: FileText },
    { name: 'Security', path: '/admin/production/security', icon: Lock },
    { name: 'Backups', path: '/admin/production/backups', icon: Database },
];

export default function ProductionLayout({ children }: { children?: React.ReactNode }) {
    const [location] = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-red-600" />
                            <h1 className="text-xl font-semibold text-gray-900">System Administration</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">v1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 font-medium">System Admin</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="bg-white rounded-lg shadow-sm border p-2 space-y-1">
                            {adminNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Security Notice */}
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex gap-2">
                                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-yellow-800">Admin Only</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        All actions are logged for security auditing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
