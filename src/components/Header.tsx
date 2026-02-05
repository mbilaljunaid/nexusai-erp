import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HelpButton } from "@/components/HelpButton";
import { WhatsNew } from "@/components/WhatsNew";
import { NotificationCenter as NotificationCenterWidget } from "@/components/NotificationCenter";
import { TipsToggle } from "@/components/QuickTips";
import { LedgerSelector } from "@/components/LedgerSelector";

export function Header() {
    return (
        <header className="flex items-center justify-between p-2 border-b gap-2 bg-background sticky top-0 z-10 w-full shrink-0">
            <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <span className="font-semibold text-lg hidden md:block">NexusAI ERP</span>
            </div>

            <div className="flex items-center gap-1">
                <LedgerSelector />
                <NotificationCenterWidget />
                <WhatsNew />
                <TipsToggle />
                <HelpButton />
                <ThemeToggle />
            </div>
        </header>
    );
}

export default Header;
