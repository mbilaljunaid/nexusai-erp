import { useState} from"react";
import { Button} from"@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from"@/components/ui/sheet";
import {
    Menu,
    FileText,
    Truck,
    AlertCircle,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    Home
} from"lucide-react";
import { cn} from"@/lib/utils";

interface MobileNavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    badge?: number;
}

interface MobileNavigationProps {
    currentPath?: string;
    onNavigate?: (path: string) => void;
}

export function MobileNavigation({ currentPath, onNavigate}: MobileNavigationProps) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems: MobileNavItem[] = [
        { icon: Home, label:"Dashboard", path:"/construction"},
        { icon: FileText, label:"Daily Logs", path:"/construction/daily-logs"},
        { icon: Truck, label:"Equipment", path:"/construction/equipment"},
        { icon: AlertCircle, label:"Compliance", path:"/construction/compliance", badge: 3},
        { icon: DollarSign, label:"Pay Apps", path:"/construction/pay-apps"},
        { icon: BarChart3, label:"Reports", path:"/construction/reports"},
    ];

    const handleNavigate = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
       }
        setIsOpen(false);
   };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
                <div className="grid grid-cols-5 gap-1 p-2">
                    {navItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;
                        return (
                            <Button variant="default"
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                className={cn(
                                   "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors relative",
                                    isActive
                                        ?"bg-primary text-primary-foreground"
                                        :"text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-5 w-5 mb-1" />
                                <span className="text-[10px] font-medium truncate w-full text-center">
                                    {item.label}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Button>
                        );
                   })}

                    {/* More Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="default" className="flex flex-col items-center justify-center text-muted-foreground hover: transition-colors">
                                <Menu className="h-5 w-5 mb-1" />
                                <span className="text-[10px] font-medium">More</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[50vh]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-6 space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPath === item.path;
                                    return (
                                        <Button variant="default"
                                            key={item.path}
                                            onClick={() => handleNavigate(item.path)}
                                            className={cn(
                                               "w-full flex items-center justify-between p-4 rounded-lg transition-colors",
                                                isActive
                                                    ?"bg-primary text-primary-foreground"
                                                    :"hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            {item.badge && item.badge > 0 && (
                                                <span className="bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Button>
                                    );
                               })}
                                <div className="border-t pt-2 mt-4">
                                    <Button variant="default"
                                        onClick={() => handleNavigate("/settings")}
                                        className="w-full flex items-center gap-3 hover: transition-colors"
                                    >
                                        <Settings className="h-5 w-5" />
                                        <span className="font-medium">Settings</span>
                                    </Button>
                                    <Button variant="default"
                                        onClick={() => handleNavigate("/logout")}
                                        className="w-full flex items-center gap-3 hover: transition-colors text-red-600"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="font-medium">Sign Out</span>
                                    </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
}

// Floating Action Button for Quick Actions
interface MobileFABProps {
    onDailyLog?: () => void;
    onEquipmentReport?: () => void;
    onComplianceIssue?: () => void;
}

export function MobileFAB({ onDailyLog, onEquipmentReport, onComplianceIssue}: MobileFABProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const actions = [
        { icon: FileText, label:"Daily Log", onClick: onDailyLog, color:"bg-blue-600 hover:bg-blue-700"},
        { icon: Truck, label:"Equipment", onClick: onEquipmentReport, color:"bg-green-600 hover:bg-green-700"},
        { icon: AlertCircle, label:"Issue", onClick: onComplianceIssue, color:"bg-orange-600 hover:bg-orange-700"},
    ];

    return (
        <div className="md:hidden fixed bottom-20 right-4">
            {/* Expanded Actions */}
            {isExpanded && (
                <div className="mb-4 space-y-3">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Button variant="default"
                                key={index}
                                onClick={() => {
                                    if (action.onClick) action.onClick();
                                    setIsExpanded(false);
                               }}
                                className={cn(
                                   "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white transition-all",
                                    action.color
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium text-sm">{action.label}</span>
                            </Button>
                        );
                   })}
                </div>
            )}

            {/* Main FAB */}
            <Button variant="destructive"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                   "h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all",
                    isExpanded
                        ?"bg-red-600 hover:bg-red-700 rotate-45"
                        :"bg-primary hover:bg-primary/90"
                )}
            >
                <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
            </Button>
        </div>
    );
}
