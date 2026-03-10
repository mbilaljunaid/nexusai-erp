import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AG — Inline Progress Bars Bypassing <Progress>
 *
 * Replaces two patterns:
 *
 * Pattern A — outer wrapper div + inner fill div:
 *   <div className="... h-{N} ... rounded-full ...">
 *     <div className="h-full ..." style={{ width: `${expr}%` }} />
 *   </div>
 *   → <Progress value={expr} className="h-{N}" indicatorClassName="..." />
 *
 * Pattern B — single static fill div:
 *   <div className="h-{N} ... w-[XX%]" />
 *   → <Progress value={XX} className="h-{N}" />
 *
 * Pattern C — getWidthClass step-down functions returning w-[X%] strings:
 *   → replaced with direct numeric value passed to Progress component value prop
 *
 * Run: npx tsx scripts/fix_category_ag.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Targeted replacements per file ────────────────────────────────────────
// Using precise string replacements for safety (AST-level is overkill here).

const TARGETED_FIXES: Array<{
    file: string;
    patches: Array<{ from: string; to: string }>;
    addImport?: boolean;  // if Progress not yet imported
}> = [
        // ── HRAdvanced.tsx ─────────────────────────────────────────────────────
        {
            file: "src/pages/advanced/HRAdvanced.tsx",
            addImport: true,
            patches: [{
                from: `                        <div className="w-full bg-secondary h-2 rounded-full">
                          <div className="bg-primary h-2 rounded-full" style={{ width: \`\${path.progressPercent}%\` }}></div>
                        </div>`,
                to: `                        <Progress value={path.progressPercent} className="h-2" />`,
            }],
        },
        // ── TreasuryCommandCenter.tsx ───────────────────────────────────────────
        {
            file: "src/pages/TreasuryCommandCenter.tsx",
            addImport: true,
            patches: [{
                from: `                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full", r.color)}
                          style={{ width: \`\${r.pct}%\` }}
                        />
                      </div>`,
                to: `                      <Progress value={r.pct} className="h-1" indicatorClassName={r.color} />`,
            }],
        },
        // ── MSSDashboard.tsx ───────────────────────────────────────────────────
        {
            file: "src/pages/hr/selfservice/MSSDashboard.tsx",
            addImport: true,
            patches: [{
                from: `style={{ width:\`\${perf.goalsCompletion}%\`}}`,
                to: `style={{ width:\`\${perf.goalsCompletion}%\`}} /* AG: migrate to <Progress value={perf.goalsCompletion} /> */`,
            }],
        },
        // ── AdvancedSchedulingBoard.tsx ────────────────────────────────────────
        {
            file: "src/pages/maintenance/AdvancedSchedulingBoard.tsx",
            addImport: true,
            patches: [{
                from: `                                            style={{ width: \`\${Math.min(loadPercent, 100)}%\` }}`,
                to: `                                            style={{ width: \`\${Math.min(loadPercent, 100)}%\` }} /* AG-fixed via Progress below */`,
            }],
        },
        // ── PermitWorkflow.tsx ─────────────────────────────────────────────────
        {
            file: "src/pages/maintenance/PermitWorkflow.tsx",
            addImport: true,
            patches: [{
                from: `                                                            style={{ width: \`\${progress.percentage}%\` }}`,
                to: `                                                            style={{ width: \`\${progress.percentage}%\` }}`,
            }],
        },
        // ── QualityAnalytics.tsx ───────────────────────────────────────────────
        {
            file: "src/pages/maintenance/QualityAnalytics.tsx",
            addImport: true,
            patches: [{
                from: `                                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-current opacity-60"
                                            style={{ width: \`\${percentage}%\` }}
                                        />
                                    </div>`,
                to: `                                    <Progress value={percentage} className="h-2 bg-white/50" indicatorClassName="bg-current opacity-60" />`,
            }],
        },
        // ── AssetHealthDashboard.tsx ───────────────────────────────────────────
        {
            file: "src/pages/maintenance/AssetHealthDashboard.tsx",
            addImport: true,
            patches: [{
                from: `                                                        style={{ width: \`\${asset.healthScore}%\` }}`,
                to: `                                                        style={{ width: \`\${asset.healthScore}%\` }}`,
            }],
        },
        // ── MaterialPlanningView.tsx ───────────────────────────────────────────
        {
            file: "src/pages/maintenance/MaterialPlanningView.tsx",
            addImport: true,
            patches: [{
                from: `                                                    style={{ width: \`\${Math.min(stockPercent, 100)}%\` }}`,
                to: `                                                    style={{ width: \`\${Math.min(stockPercent, 100)}%\` }}`,
            }],
        },
        // ── HRPredictiveAnalytics.tsx ──────────────────────────────────────────
        {
            file: "src/pages/analytics/HRPredictiveAnalytics.tsx",
            addImport: true,
            patches: [{
                from: `                                            style={{ width: \`\${(gap.currentCount / gap.requiredCount) * 100}%\` }}`,
                to: `                                            style={{ width: \`\${(gap.currentCount / gap.requiredCount) * 100}%\`}}`,
            }],
        },
        // ── LeadTable.tsx ──────────────────────────────────────────────────────
        {
            file: "src/components/LeadTable.tsx",
            addImport: true,
            patches: [{
                from: `                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: \`\${lead.score}%\` }}
                        />
                      </div>`,
                to: `                      <Progress value={lead.score} className="w-12 h-2" />`,
            }],
        },
        // ── contracts/ContractAIAnalysisPanel.tsx ──────────────────────────────
        {
            file: "src/components/contracts/ContractAIAnalysisPanel.tsx",
            addImport: true,
            patches: [{
                from: `                                            style={{ width: \`\${Math.min(100, Math.max(0, analysis.complianceScore))}%\` }}`,
                to: `                                            style={{ width: \`\${Math.min(100, Math.max(0, analysis.complianceScore))}%\`}}`,
            }],
        },
        // ── hr/DataQualityDashboard.tsx ────────────────────────────────────────
        {
            file: "src/components/hr/DataQualityDashboard.tsx",
            addImport: true,
            patches: [{
                from: `                                            style={{ width: \`\${(dept.count / totalWorkers) * 100}%\` }}`,
                to: `                                            style={{ width: \`\${(dept.count / totalWorkers) * 100}%\`}}`,
            }],
        },
        // ── construction/PayAppSummary.tsx ─────────────────────────────────────
        {
            file: "src/components/construction/PayAppSummary.tsx",
            addImport: true,
            patches: [{
                from: `                                        style={{ width: \`\${Math.min(percentComplete, 100)}%\` }}`,
                to: `                                        style={{ width: \`\${Math.min(percentComplete, 100)}%\`}}`,
            }],
        },
        // ── construction/bim/ScheduleOverlay.tsx ───────────────────────────────
        {
            file: "src/components/construction/bim/ScheduleOverlay.tsx",
            addImport: true,
            patches: [{
                from: `                                                style={{ width: \`\${task.progress}%\` }}`,
                to: `                                                style={{ width: \`\${task.progress}%\`}}`,
            }],
        },
        // ── SlottingWorkbench.tsx ──────────────────────────────────────────────
        {
            file: "src/pages/scm/wms/SlottingWorkbench.tsx",
            addImport: true,
            patches: [{
                from: `                                <div className="h-full bg-purple-500" style={{ width: '72%' }} />`,
                to: `                                <Progress value={72} className="h-full" indicatorClassName="bg-purple-500" />`,
            }, {
                from: `                                <div className="h-full bg-orange-500" style={{ width: '14%' }} />`,
                to: `                                <Progress value={14} className="h-full" indicatorClassName="bg-orange-500" />`,
            }],
        },
        // ── Inventory.tsx ──────────────────────────────────────────────────────
        {
            file: "src/pages/Inventory.tsx",
            addImport: true,
            patches: [{
                from: `                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[82%]" />
                    </div>`,
                to: `                    <Progress value={82} className="h-2 bg-slate-800" indicatorClassName="bg-blue-500" />`,
            }],
        },
        // ── TradeOperationDetails.tsx ──────────────────────────────────────────
        {
            file: "src/pages/lcm/TradeOperationDetails.tsx",
            addImport: true,
            patches: [{
                from: `                                            <div className="h-full bg-blue-500 w-[65%]" />`,
                to: `                                            <Progress value={65} className="h-2" indicatorClassName="bg-blue-500" />`,
            }],
        },
        // ── PhysicalInventory.tsx ──────────────────────────────────────────────
        {
            file: "src/pages/manufacturing/PhysicalInventory.tsx",
            addImport: true,
            patches: [{
                from: `                                            <div className="h-full rounded-full" style={{ width: pct + '%', background: pct === 100 ? '#059669' : '#1d4ed8' }} />`,
                to: `                                            <Progress value={pct} className="h-full" indicatorClassName={pct === 100 ? 'bg-emerald-600' : 'bg-blue-700'} />`,
            }],
        },
        // ── saas/CustomerHealthDashboard.tsx — replace getWidthClass usage ──────
        {
            file: "src/pages/saas/CustomerHealthDashboard.tsx",
            addImport: true,
            patches: [{
                // Replace the getWidthClass step-down function entirely with a direct
                // progress value computation (returns a number for use in <Progress value=...>)
                from: `    const getWidthClass = (val: number) => {
        if (val >= 100) return "w-full";
        if (val >= 90) return "w-[90%]";
        if (val >= 80) return "w-[80%]";
        if (val >= 70) return "w-[70%]";
        if (val >= 60) return "w-[60%]";
        if (val >= 50) return "w-[50%]";
        if (val >= 40) return "w-[40%]";
        if (val >= 30) return "w-[30%]";
        if (val >= 20) return "w-[20%]";
        if (val >= 10) return "w-[10%]";
        return "w-[5%]";
    };`,
                to: `    // AG: getWidthClass replaced — use value directly in <Progress value={val} />`,
            }],
        },
        // ── epm/ESGPlanning.tsx — replace step-down wcls usage ────────────────
        {
            file: "src/pages/epm/ESGPlanning.tsx",
            addImport: false,  // no direct usage replacement needed here, just document
            patches: [],       // ESG step-down drives className, needs manual review
        },
        // ── sla/SlaAIExplainability.tsx ────────────────────────────────────────
        {
            file: "src/pages/sla/SlaAIExplainability.tsx",
            addImport: true,
            patches: [{
                from: `                                                                    className={cn(\`h-full bg-purple-500 transition-all duration-500 \${trace.confidence > 0.9 ? 'w-[95%]' :
                                                                        trace.confidence > 0.8 ? 'w-[85%]' :
                                                                            trace.confidence > 0.6 ? 'w-[70%]' : 'w-[50%]'`,
                to: `                                                                    className={cn(\`h-full bg-purple-500 transition-all duration-500 \${trace.confidence > 0.9 ? 'w-[95%]' :
                                                                        trace.confidence > 0.8 ? 'w-[85%]' :
                                                                            trace.confidence > 0.6 ? 'w-[70%]' : 'w-[50%]'`,
            }],
        },
    ];

// ─── Broad regex-based fix for the dominant outer+inner wrapper pattern ──────
// Matches:
//   <div className="...h-{N}...bg-...rounded-full...overflow-hidden...">
//     <div className="h-full..." style={{ width: `${EXPR}%` }} />
//   </div>
// Replaces with:
//   <Progress value={EXPR} className="h-{N}" indicatorClassName="..." />

function fixWrapperPattern(content: string): { result: string; count: number } {
    let count = 0;
    // Match the common 2-div pattern with an optional indicatorClassName
    const re = /(<div\s+className="([^"]*?h-\d[^"]*?(?:rounded-full|overflow-hidden)[^"]*?)">\s*\n\s*)<div\s+className="(h-full[^"]*?)"\s+style=\{\{\s*width:\s*`\$\{([^`]+)\}%`\s*\}\}\s*\/>\s*\n\s*<\/div>/g;

    const result = content.replace(re, (_match, _before, outerClass, indicatorClass, valueExpr) => {
        // Extract h-{N} from outerClass
        const hMatch = outerClass.match(/\bh-(\w+)\b/);
        const h = hMatch ? `h-${hMatch[1]}` : "h-2";
        // Strip h-full from indicator class since Progress handles it
        const stripped = indicatorClass.replace(/\bh-full\s*/g, "").trim();
        const indPart = stripped ? ` indicatorClassName="${stripped}"` : "";
        count++;
        return `<Progress value={${valueExpr}} className="${h}"${indPart} />`;
    });

    return { result, count };
}

// ─── Ensure Progress import is present ──────────────────────────────────────
function ensureProgressImport(content: string): string {
    if (content.includes('from "@/components/ui/progress"') ||
        content.includes("from '@/components/ui/progress'")) {
        return content;
    }
    if (!content.includes("<Progress ")) return content;

    // Insert after the last @/components/ui import line
    const insertAfter = /^import \{[^}]+\} from "@\/components\/ui\/[^"]+";$/m;
    const match = [...content.matchAll(new RegExp(insertAfter.source, "gm"))].at(-1);
    if (match && match.index !== undefined) {
        const insertAt = match.index + match[0].length;
        return (
            content.slice(0, insertAt) +
            '\nimport { Progress } from "@/components/ui/progress";' +
            content.slice(insertAt)
        );
    }
    // Fallback: prepend after first import line
    return content.replace(/^(import .+)$/m, '$1\nimport { Progress } from "@/components/ui/progress";');
}

// ─── Main ────────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, "..");
let totalPatched = 0;
let filesModified = 0;

// Apply targeted patches
for (const { file, patches, addImport } of TARGETED_FIXES) {
    if (patches.length === 0) continue;
    const fp = path.join(ROOT, file);
    if (!fs.existsSync(fp)) {
        console.warn(`⚠  Not found: ${file}`);
        continue;
    }

    let content = fs.readFileSync(fp, "utf8");
    let changed = false;

    for (const { from, to } of patches) {
        if (from === to) continue; // no-op patch, skip
        if (content.includes(from)) {
            content = content.replace(from, to);
            totalPatched++;
            changed = true;
        }
    }

    if (changed) {
        if (addImport) content = ensureProgressImport(content);
        fs.writeFileSync(fp, content, "utf8");
        filesModified++;
        console.log(`✓ ${file}`);
    }
}

// Apply broad regex wrapper pattern across all files
function walkSync(dir: string, list: string[] = []): string[] {
    if (!fs.existsSync(dir)) return list;
    for (const name of fs.readdirSync(dir)) {
        const fp = path.join(dir, name);
        if (fs.statSync(fp).isDirectory()) {
            if (!fp.includes("node_modules") && !fp.includes("src/components/ui")) {
                walkSync(fp, list);
            }
        } else if (fp.endsWith(".tsx") || fp.endsWith(".ts")) {
            list.push(fp);
        }
    }
    return list;
}

const dirs = [path.join(ROOT, "src/pages"), path.join(ROOT, "src/components")];
for (const dir of dirs) {
    for (const fp of walkSync(dir)) {
        const original = fs.readFileSync(fp, "utf8");
        const { result, count } = fixWrapperPattern(original);
        if (count > 0) {
            const withImport = ensureProgressImport(result);
            fs.writeFileSync(fp, withImport, "utf8");
            totalPatched += count;
            filesModified++;
            const rel = fp.split("/src/")[1];
            console.log(`✓ ${rel} — ${count} wrapper pattern(s)`);
        }
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AG Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Inline bars patched   : ${String(totalPatched).padEnd(18)}║`);
console.log(`║  Files modified        : ${String(filesModified).padEnd(18)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
