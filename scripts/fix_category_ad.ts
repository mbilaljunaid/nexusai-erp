import { Project, SyntaxKind, JsxOpeningElement } from "ts-morph";

/**
 * FIX: Category AD — Icon-Only Buttons Missing aria-label
 *
 * For every <Button size="icon"> element that lacks aria-label:
 *  1. Inspects the direct child JSX elements to find the first Lucide icon name
 *  2. Maps that icon name to a human-readable label via ICON_LABEL_MAP
 *  3. Injects aria-label="<label>" as a new JSX attribute on the Button
 *  4. Falls back to aria-label="Action" when the icon cannot be determined
 *
 * Run: npx tsx scripts/fix_category_ad.ts
 */

// ─────────────────────────────────────────────────────────────────
// Icon → aria-label mapping
// ─────────────────────────────────────────────────────────────────
const ICON_LABEL_MAP: Record<string, string> = {
    // Destructive
    Trash2: "Delete",
    Trash: "Delete",

    // Edit / Write
    Pencil: "Edit",
    PenLine: "Edit",
    PenSquare: "Edit",
    Edit: "Edit",
    Edit2: "Edit",
    Edit3: "Edit",
    FilePenLine: "Edit",
    SquarePen: "Edit",
    NotebookPen: "Edit",

    // Create / Add
    Plus: "Add",
    PlusCircle: "Add",
    PlusSquare: "Add",
    FolderPlus: "Add",

    // Close / Dismiss
    X: "Close",
    XCircle: "Close",
    XSquare: "Close",
    XOctagon: "Close",

    // Confirm / Done
    Check: "Confirm",
    CheckCircle: "Confirm",
    CheckCircle2: "Confirm",
    CheckSquare: "Confirm",
    CircleCheck: "Confirm",

    // Navigation — directional
    ArrowLeft: "Go back",
    ArrowRight: "Go forward",
    ArrowUp: "Move up",
    ArrowDown: "Move down",
    ChevronLeft: "Previous",
    ChevronRight: "Next",
    ChevronUp: "Expand",
    ChevronDown: "Collapse",
    ChevronsUpDown: "Toggle",
    ChevronsLeftRight: "Toggle",
    ArrowUpDown: "Sort",

    // File operations
    Download: "Download",
    FileDown: "Download",
    Upload: "Upload",
    FileUp: "Upload",
    FileText: "View file",
    File: "View file",
    FilePlus: "Add file",
    FileMinus: "Remove file",
    FolderOpen: "Open folder",

    // Search / Filter
    Search: "Search",
    Filter: "Filter",
    SlidersHorizontal: "Filters",
    Sliders: "Filters",

    // Settings / Config
    Settings: "Settings",
    Settings2: "Settings",
    Cog: "Settings",
    Wrench: "Configure",

    // Refresh / Sync
    RefreshCw: "Refresh",
    RefreshCcw: "Refresh",
    RotateCcw: "Undo",
    RotateCw: "Redo",
    Sync: "Sync",

    // View / Visibility
    Eye: "View",
    EyeOff: "Hide",

    // Copy / Paste
    Copy: "Copy",
    ClipboardCopy: "Copy",
    Clipboard: "Copy",
    ClipboardPaste: "Paste",

    // Links / External
    ExternalLink: "Open link",
    Link: "Copy link",
    Link2: "Copy link",
    Unlink: "Remove link",
    Unlink2: "Remove link",

    // Overflow menus
    MoreHorizontal: "More options",
    MoreVertical: "More options",
    Ellipsis: "More options",

    // Favourites / Reactions
    Star: "Favourite",
    StarOff: "Remove favourite",
    Heart: "Like",
    HeartOff: "Unlike",
    ThumbsUp: "Thumbs up",
    ThumbsDown: "Thumbs down",

    // Share
    Share: "Share",
    Share2: "Share",

    // Info / Help
    Info: "Information",
    HelpCircle: "Help",
    AlertCircle: "Alert",
    AlertTriangle: "Warning",

    // Notifications
    Bell: "Notifications",
    BellOff: "Mute notifications",
    BellRing: "Notifications",

    // Loading
    Loader2: "Loading",
    Loader: "Loading",

    // Zoom
    ZoomIn: "Zoom in",
    ZoomOut: "Zoom out",

    // Fullscreen
    Maximize: "Fullscreen",
    Maximize2: "Fullscreen",
    Minimize: "Exit fullscreen",
    Minimize2: "Exit fullscreen",
    Expand: "Expand",

    // Save / Send / Mail
    Save: "Save",
    SaveAll: "Save all",
    Send: "Send",
    Mail: "Email",

    // Communication
    Phone: "Call",
    MessageSquare: "Message",
    MessageCircle: "Message",
    Messages: "Messages",

    // Security
    Lock: "Lock",
    LockOpen: "Unlock",
    Unlock: "Unlock",
    Shield: "Security",
    ShieldCheck: "Verified",

    // User
    User: "User",
    Users: "Users",
    UserPlus: "Add user",
    UserMinus: "Remove user",
    UserX: "Remove user",
    UserCheck: "Verify user",

    // Home / Navigation
    Home: "Home",
    LayoutDashboard: "Dashboard",
    LayoutGrid: "Grid view",
    List: "List view",
    Table: "Table view",

    // Data / Chart
    BarChart: "Chart",
    BarChart2: "Chart",
    LineChart: "Chart",
    PieChart: "Chart",
    TrendingUp: "Trend up",
    TrendingDown: "Trend down",

    // Miscellaneous
    Tag: "Tag",
    Tags: "Tags",
    Flag: "Flag",
    Bookmark: "Bookmark",
    BookmarkMinus: "Remove bookmark",
    Terminal: "Terminal",
    Code: "Code",
    Code2: "Code",
    Layers: "Layers",
    Globe: "Website",
    Map: "Map",
    MapPin: "Location",
    Calendar: "Calendar",
    Clock: "Time",
    Timer: "Timer",
    Play: "Play",
    Pause: "Pause",
    Stop: "Stop",
    SkipForward: "Skip",
    SkipBack: "Back",
    Power: "Power",
    Zap: "Quick action",
    Wand2: "Magic",
    Sparkles: "AI",
    Bot: "AI",
    Brain: "AI",
    Cpu: "System",
    Server: "Server",
    Database: "Database",
    HardDrive: "Storage",
    Network: "Network",
    Wifi: "Network",
    Bluetooth: "Bluetooth",
    Printer: "Print",
    Scan: "Scan",
    Camera: "Camera",
    Image: "Image",
    ImageOff: "Remove image",
    Video: "Video",
    Mic: "Microphone",
    MicOff: "Mute",
    Volume: "Volume",
    VolumeX: "Mute",
    Volume2: "Volume",
    ArrowUpRight: "Open",
    ArrowDownLeft: "Collapse",
    SortAsc: "Sort ascending",
    SortDesc: "Sort descending",
    TableProperties: "Properties",
    FormInput: "Input",
    LogOut: "Log out",
    LogIn: "Log in",
    DoorOpen: "Exit",
    Repeat: "Repeat",
    Repeat2: "Repeat",
    Shuffle: "Shuffle",
    Grid: "Grid",
    Grid2X2: "Grid",
    Grid3X3: "Grid",
    Grip: "Drag",
    GripVertical: "Drag",
    GripHorizontal: "Drag",
    Move: "Move",
    Crosshair: "Target",
    Target: "Target",
    Focus: "Focus",
    Maximize2x2: "Expand",
    PanelLeftClose: "Close panel",
    PanelRightClose: "Close panel",
    PanelLeftOpen: "Open panel",
    SidebarOpen: "Open sidebar",
    SidebarClose: "Close sidebar",
    MenuSquare: "Menu",
    Menu: "Menu",
    LayoutList: "List",
    AlignLeft: "Align left",
    AlignCenter: "Align center",
    AlignRight: "Align right",
    Bold: "Bold",
    Italic: "Italic",
    Underline: "Underline",
    Strikethrough: "Strikethrough",
    Minus: "Remove",
    MinusCircle: "Remove",
    Ban: "Block",
    CircleSlash: "Block",
    Archive: "Archive",
    ArchiveRestore: "Restore",
    Recycle: "Restore",
    History: "History",
    ClockRewind: "History",
    GitMerge: "Merge",
    GitBranch: "Branch",
    GitCommit: "Commit",
    Diff: "Diff",
    PackagePlus: "Add package",
    Package: "Package",
    Boxes: "Packages",
    ShoppingCart: "Cart",
    ShoppingBag: "Shop",
    Receipt: "Receipt",
    Banknote: "Payment",
    CreditCard: "Card",
    Wallet: "Wallet",
    Building: "Organization",
    Building2: "Organization",
    Briefcase: "Work",
    GraduationCap: "Education",
    Award: "Achievement",
    Trophy: "Achievement",
    Medal: "Achievement",
    Gift: "Gift",
    Percent: "Discount",
    Calculator: "Calculate",
    Sigma: "Calculate",
    Equal: "Equals",
    DollarSign: "Currency",
    Euro: "Currency",
    PoundSterling: "Currency",
    Coins: "Currency",
    IndianRupee: "Currency",

    // Additional icons found in audit
    Activity: "Activity",
    HistoryIcon: "History",
    CalendarIcon: "Calendar",
    ImageIcon: "Image",
    MessageSquarePlus: "New message",
    CheckCheck: "Confirm all",
    Lightbulb: "Insights",
    PlayCircle: "Play",
    Sun: "Light mode",
    Moon: "Dark mode",
    SunMoon: "Toggle theme",
    Contrast: "Toggle theme",
    WrapText: "Wrap text",
    ListOrdered: "Ordered list",
    ListTree: "Tree view",
    Columns: "Columns",
    PanelRight: "Panel",
    PanelLeft: "Panel",
    Split: "Split view",
    Merge: "Merge",
    Braces: "Code block",
    Hash: "Hashtag",
    AtSign: "Mention",
    Quote: "Quote",
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function getLabelForIcon(iconName: string): string {
    return ICON_LABEL_MAP[iconName] ?? "Action";
}

// ─────────────────────────────────────────────────────────────────
// Main codemod
// ─────────────────────────────────────────────────────────────────
const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
    skipAddingFilesFromTsConfig: false,
});

let totalFixed = 0;
let totalFallbacks = 0;
let filesModified = 0;

const sourceFiles = project.getSourceFiles([
    "src/pages/**/*.tsx",
    "src/components/**/*.tsx",
]);

for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("src/components/ui/")) continue;

    let modified = false;

    // Collect first, then mutate (avoid collection invalidation)
    const violations: Array<{
        element: JsxOpeningElement;
        childIcon: string;
    }> = [];

    const jsxElements: JsxOpeningElement[] = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ];

    for (const element of jsxElements) {
        const tagName = element.getTagNameNode().getText();
        if (tagName !== "Button") continue;

        const attrs = element.getAttributes();

        // Must have size="icon"
        const hasSizeIcon = attrs.some(attr => {
            if (attr.getKind() !== SyntaxKind.JsxAttribute) return false;
            const a = attr.asKindOrThrow(SyntaxKind.JsxAttribute);
            if (a.getNameNode().getText() !== "size") return false;
            const init = a.getInitializer();
            if (!init) return false;
            return init.getText().replace(/['"{}]/g, "") === "icon";
        });
        if (!hasSizeIcon) continue;

        // Must NOT already have aria-label
        const hasAriaLabel = attrs.some(attr => {
            if (attr.getKind() !== SyntaxKind.JsxAttribute) return false;
            return attr.asKindOrThrow(SyntaxKind.JsxAttribute).getNameNode().getText() === "aria-label";
        });
        if (hasAriaLabel) continue;

        // Determine child icon from the parent JsxElement's children
        let childIcon = "";
        const parent = element.getParent();
        if (parent && parent.getKind() === SyntaxKind.JsxElement) {
            const children = parent.asKindOrThrow(SyntaxKind.JsxElement).getJsxChildren();
            for (const child of children) {
                if (child.getKind() === SyntaxKind.JsxSelfClosingElement) {
                    const name = child.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText();
                    if (/^[A-Z]/.test(name)) {
                        childIcon = name;
                        break;
                    }
                } else if (child.getKind() === SyntaxKind.JsxElement) {
                    // Nested element — look one level deeper
                    const inner = child.asKindOrThrow(SyntaxKind.JsxElement).getJsxChildren();
                    for (const ic of inner) {
                        if (ic.getKind() === SyntaxKind.JsxSelfClosingElement) {
                            const name = ic.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText();
                            if (/^[A-Z]/.test(name)) {
                                childIcon = name;
                                break;
                            }
                        }
                    }
                    if (childIcon) break;
                }
            }
        }

        violations.push({ element, childIcon });
    }

    // Apply mutations
    for (const { element, childIcon } of violations) {
        const label = getLabelForIcon(childIcon);
        if (!childIcon || !(childIcon in ICON_LABEL_MAP)) {
            totalFallbacks++;
        }

        // Add aria-label BEFORE any existing attributes (best practice: near size=)
        // ts-morph addAttribute appends by default — this is acceptable
        element.addAttribute({
            name: "aria-label",
            initializer: `"${label}"`,
        });

        totalFixed++;
        modified = true;
    }

    if (modified) {
        sourceFile.saveSync();
        filesModified++;
        console.log(`✓ ${filePath.split("/src/")[1]} — ${violations.length} label(s) injected`);
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AD Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Total buttons patched : ${String(totalFixed).padEnd(18)}║`);
console.log(`║  Files modified        : ${String(filesModified).padEnd(18)}║`);
console.log(`║  Fallback labels used  : ${String(totalFallbacks).padEnd(18)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nNext step: npx tsc --noEmit`);
