
import { Link, useLocation } from "wouter";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    LogOut,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export default function CustomerPortalLayout({ children }: { children: ReactNode }) {
    const [location, setLocation] = useLocation();
    const customer = JSON.parse(localStorage.getItem("portal_customer") || "null");

    if (!customer) {
        if (location !== "/portal/login") {
            setLocation("/portal/login");
            return null;
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("portal_token");
        localStorage.removeItem("portal_customer");
        setLocation("/portal/login");
    };

    if (location === "/portal/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-800">Nexus<span className="text-emerald-600">Portal</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">Welcome, {customer?.name}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-500">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white min-h-[calc(100vh-64px)] border-r px-4 py-6 hidden md:block fixed h-full">
                    <div className="space-y-1">
                        <NavItem href="/portal/dashboard" icon={LayoutDashboard} label="Overview" active={location === "/portal/dashboard"} />
                        <NavItem href="/portal/invoices" icon={FileText} label="Invoices" active={location === "/portal/invoices"} />
                        <NavItem href="/portal/payments" icon={CreditCard} label="Payments" active={location === "/portal/payments"} />
                        <NavItem href="/portal/profile" icon={User} label="Profile" active={location === "/portal/profile"} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon: Icon, label, active }: any) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer ${active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}>
                <Icon className={`h-4 w-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                {label}
            </div>
        </Link>
    );
}
