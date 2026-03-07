import { ReactNode } from "react";

interface ModuleLayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
}

export default function ModuleLayout({ children, sidebar }: ModuleLayoutProps) {
    return (
        <div className="flex flex-1 h-full overflow-hidden">
            {/* Secondary Sidebar (Context) */}
            {sidebar && (
                <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                    {sidebar}
                </aside>
            )}

            {/* Main Module Content */}
            <main className="flex-1 overflow-y-auto bg-muted/50/50 p-6">
                {children}
            </main>
        </div>
    );
}
