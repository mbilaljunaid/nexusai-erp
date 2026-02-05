import { AppSidebar } from "../AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  return (
    <SidebarProvider>
      <div className="flex h-[400px] w-full">
        <AppSidebar />
        <main className="flex-1 p-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <p className="mt-4 text-muted-foreground">Main content area</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
