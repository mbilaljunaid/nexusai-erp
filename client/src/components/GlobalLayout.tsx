// client/src/components/GlobalLayout.tsx
import React, { ReactNode } from "react";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";

/**
 * GlobalLayout – wraps the entire application with a consistent header, sidebar,
 * main content area, and footer. Implements the Oracle‑like sidebar model and
 * provides a placeholder for the UI Formatter Service.
 *
 * This component does **not** delete or modify any existing pages; it simply
 * provides a structural wrapper that can be applied to routes.
 */
export default function GlobalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen flex-col w-full">
            {/* Header – SAP Fiori ShellBar style */}
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                {/* Main content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}
