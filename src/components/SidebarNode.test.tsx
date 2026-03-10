import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SidebarNodeRenderer } from "./SidebarNode";
import { SidebarNode } from "@/types/sidebar";
import { Router } from "wouter";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
    ChevronRight: () => <div data-testid="chevron-right" />,
    User: () => <div data-testid="icon-user" />,
    ChevronDown: () => <div data-testid="chevron-down" />,
}));

// Mock Sidebar components from shadcn/ui if necessary, but assuming they work in test environment or are simple div wrappers
// If they use internal context or specialized hooks, we might need a more robust wrapper.
// SidebarProvider provides the context.

const mockLinkNode: SidebarNode = {
    id: "test-link",
    title: "Test Link",
    type: "link",
    path: "/test-path",
};

const mockSectionNode: SidebarNode = {
    id: "test-section",
    title: "Test Section",
    type: "section",
    children: [mockLinkNode],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Router>
        <SidebarProvider>{children}</SidebarProvider>
    </Router>
);

describe("SidebarNodeRenderer", () => {
    it("renders a link node", () => {
        render(
            <Wrapper>
                <SidebarNodeRenderer node={mockLinkNode} />
            </Wrapper>
        );
        expect(screen.getByText("Test Link")).toBeInTheDocument();
        // wouter links render as anchors.
        const link = screen.getByText("Test Link").closest('a');
        expect(link).toHaveAttribute("href", "/test-path");
    });

    it("renders a section node with children", () => {
        render(
            <Wrapper>
                <SidebarNodeRenderer node={mockSectionNode} />
            </Wrapper>
        );
        // Section label
        expect(screen.getByText("Test Section")).toBeInTheDocument();
        // Child link
        expect(screen.getByText("Test Link")).toBeInTheDocument();
    });
});
