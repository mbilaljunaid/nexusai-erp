import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { GlobalSpotlight } from "@/components/GlobalSpotlight";
import { Toaster } from "@/components/ui/toaster";

interface GlobalLayoutProps {
    children: React.ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
    return (
        <SidebarProvider>
            <GlobalSpotlight />
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-8 md:p-6 animate-in fade-in duration-500">
                    {children}
                </main>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
