
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { LucideIcon } from "lucide-react";

interface MenuItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

interface MenuSection {
    label: string;
    items: MenuItem[];
}

interface ModuleNavigationGridProps {
    menu: MenuSection[];
}

export function ModuleNavigationGrid({ menu }: ModuleNavigationGridProps) {
    return (
        <div className="space-y-8 mb-8">
            {menu.map((section, idx) => (
                <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground border-b pb-2">
                        {section.label}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {section.items.map((item, itemIdx) => (
                            <Link key={itemIdx} href={item.url}>
                                <div className="group cursor-pointer">
                                    <Card className="h-full border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3 text-center h-full">
                                            <div className="p-3 rounded-full bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                                {item.title}
                                            </span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
