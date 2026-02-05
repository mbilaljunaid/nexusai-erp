import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GlobalLayout from "./GlobalLayout";
import { Router } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RBACProvider } from "@/components/RBACContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock child components that rely on complex contexts or are irrelevant to layout structure
jest.mock("@/components/Header", () => ({
    Header: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock("@/components/AppSidebar", () => ({
    AppSidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

jest.mock("@/components/Footer", () => ({
    Footer: () => <div data-testid="mock-footer">Footer</div>,
}));

// Mock hook since RBAC logic uses it
jest.mock("@/components/RBACContext", () => ({
    useRBAC: () => ({ userRole: "admin", userId: "test-user", logout: jest.fn() }),
    RBACProvider: ({ children }: any) => <div>{children}</div>
}));

const queryClient = new QueryClient();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <Router>
            <ThemeProvider>
                <TooltipProvider>
                    <SidebarProvider>
                        {children}
                    </SidebarProvider>
                </TooltipProvider>
            </ThemeProvider>
        </Router>
    </QueryClientProvider>
);

describe("GlobalLayout", () => {
    it("renders header, sidebar, main content, and footer", () => {
        render(
            <Wrapper>
                <GlobalLayout>
                    <div data-testid="main-content">Main Content</div>
                </GlobalLayout>
            </Wrapper>
        );

        expect(screen.getByTestId("mock-header")).toBeInTheDocument();
        expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
        expect(screen.getByTestId("main-content")).toBeInTheDocument();
        expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    });
});
