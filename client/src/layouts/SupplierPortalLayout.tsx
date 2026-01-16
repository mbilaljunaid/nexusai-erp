import { ReactNode } from "react";
import { LogOut, Package2, Home, Truck, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { useLocation, Link } from "wouter";

export default function SupplierPortalLayout({ children }: { children: ReactNode }) {
    const [, setLocation] = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("supplier_token");
        setLocation("/portal/supplier/login");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex gap-2 font-bold text-lg text-primary items-center">
                        <Package2 className="h-6 w-6" />
                        <span>Nexus iSupplier</span>
                    </div>
                    <nav className="flex items-center space-x-6 px-6 text-sm font-medium">
                        <Link href="/portal/supplier/dashboard">
                            <a className="flex items-center text-slate-600 hover:text-primary transition-colors">
                                <Home className="mr-2 h-4 w-4" />
                                Dashboard
                            </a>
                        </Link>
                        <Link href="/portal/supplier/orders">
                            <a className="flex items-center text-slate-600 hover:text-primary transition-colors">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Orders
                            </a>
                        </Link>
                        <Link href="/portal/supplier/asns">
                            <a className="flex items-center text-slate-600 hover:text-primary transition-colors">
                                <Truck className="mr-2 h-4 w-4" />
                                Shipments
                            </a>
                        </Link>
                        <Link href="/portal/supplier/performance">
                            <a className="flex items-center text-slate-600 hover:text-primary transition-colors">
                                <Package2 className="mr-2 h-4 w-4" />
                                Performance
                            </a>
                        </Link>
                    </nav>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-6">
                {children}
            </main>
        </div>
    );
}
