import React from'react';
import { Link, useLocation} from'wouter';
import {
    LayoutDashboard,
    Users,
    Building2,
    TestTube,
    Package,
    Map,
    CreditCard,
    Settings,
    FileText,
    Shield,
    ActivityIcon,
    ChevronLeft,
    Menu
} from'lucide-react';
import { Button} from'@/components/ui/button';
import { cn} from'@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navigation = [
    {
        name:'Dashboard',
        href:'/admin',
        icon: LayoutDashboard,
   },
    {
        name:'Tenant Management',
        href:'/admin/tenants',
        icon: Building2,
   },
    {
        name:'Demo Management',
        href:'/admin/demos',
        icon: TestTube,
   },
    {
        name:'Module Management',
        href:'/admin/modules',
        icon: Package,
   },
    {
        name:'Module-Industry Mapping',
        href:'/admin/module-mapping',
        icon: Map,
   },
    {
        name:'Subscription & Billing',
        href:'/admin/billing',
        icon: CreditCard,
   },
    {
        name:'Users & Access',
        href:'/admin/users',
        icon: Users,
   },
    {
        name:'Content Management',
        href:'/admin/content',
        icon: FileText,
   },
    {
        name:'Audit & Logs',
        href:'/admin/audit',
        icon: ActivityIcon,
   },
    {
        name:'System Configuration',
        href:'/admin/config',
        icon: Settings,
   },
    {
        name:'Security Settings',
        href:'/admin/security',
        icon: Shield,
   },
];

export default function AdminLayout({ children}: AdminLayoutProps) {
    const [location] = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={cn(
                   'fixed left-0 top-0 h-screen transition-all duration-300 bg-gray-900 text-white',
                    sidebarOpen ?'w-64' :'w-16'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-blue-400" />
                            <span className="font-semibold">Admin Panel</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-800"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <ChevronLeft className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </Button>
                </div>

                {/* Back to App */}
                <Link href="/dashboard">
                    <a className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 border-b border-gray-800 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm">Back to App</span>}
                    </a>
                </Link>

                {/* Navigation */}
                <nav className="p-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location === item.href || (item.href !=='/admin' && location.startsWith(item.href));
                        return (
                            <Link key={item.name} href={item.href}>
                                <a
                                    className={cn(
                                       'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                                        isActive
                                            ?'bg-blue-600 text-white'
                                            :'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    )}
                                    title={!sidebarOpen ? item.name : undefined}
                                >
                                    <item.icon className="w-5 h-5 shrink-0" />
                                    {sidebarOpen && <span className="text-sm">{item.name}</span>}
                                </a>
                            </Link>
                        );
                   })}
                </nav>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                   'transition-all duration-300',
                    sidebarOpen ?'ml-64' :'ml-16'
                )}
            >
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
