import { cn } from "@/lib/utils";

import React from'react';
import { motion} from'framer-motion';
import { ArrowRight, Database, FileInput, FileOutput, Server, Settings, Shuffle} from'lucide-react';
import { Card} from'@/components/ui/card';
import { Badge} from'@/components/ui/badge';

interface AdrFlowProps {
    ruleType:'Account' |'Segment';
    sourceType:'Constant' |'MappingSet' |'Source';
    constantValue?: string;
    sourceAttribute?: string;
    mappingSetId?: string; // In real app, we'd look up the name
    mappingSetName?: string; // Passed for display
}

export function AdrFlow({ ruleType, sourceType, constantValue, sourceAttribute, mappingSetName}: AdrFlowProps) {
    return (
        <div className="flex items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 min-h-72 w-full relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                // eslint-disable-next-line react-dom/no-unsafe-styles
                style={{ backgroundImage:'radial-gradient(#475569 1px, transparent 1px)', backgroundSize:'20px 20px'}}
            />

            <div className="flex items-center gap-4">

                {/* 1. INPUT NODE */}
                <FlowNode
                    title="Input Source"
                    icon={sourceType ==='Constant' ? FileInput : Server}
                    color="blue"
                    delay={0}
                >
                    <div className="text-sm font-medium text-slate-700">
                        {sourceType ==='Constant' ?'Constant Value' :'Transaction Attribute'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 px-2 py-1 rounded">
                        {sourceType ==='Constant'
                            ? (constantValue ||'No Value Defined')
                            : (sourceAttribute ||'Select Input...')}
                    </div>
                </FlowNode>

                {/* Connection 1 */}
                <FlowConnection active={true} />

                {/* 2. LOGIC NODE (Optional) */}
                {sourceType ==='MappingSet' && (
                    <>
                        <FlowNode
                            title="Transformation"
                            icon={Shuffle}
                            color="purple"
                            delay={0.2}
                        >
                            <div className="text-sm font-medium text-slate-700">Mapping Set</div>
                            <div className="text-xs text-slate-500 mt-1">
                                {mappingSetName ||'Select Mapping...'}
                            </div>
                        </FlowNode>
                        <FlowConnection active={true} />
                    </>
                )}

                {/* 3. OUTPUT NODE */}
                <FlowNode
                    title="Output"
                    icon={FileOutput}
                    color="emerald"
                    delay={sourceType ==='MappingSet' ? 0.4 : 0.2}
                >
                    <div className="text-sm font-medium text-slate-700">
                        {ruleType ==='Account' ?'Full GL Account' :'Segment Value'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {ruleType ==='Account' ?'CCID' :'Segment'}
                    </div>
                </FlowNode>

            </div>

            {/* Legend / Info */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur border rounded px-3 py-1 text-[10px] text-muted-foreground shadow-sm">
                Live Derivation Preview
            </div>
        </div>
    );
}

function FlowNode({ title, icon: Icon, children, color, delay}: any) {
    const colorStyles: any = {
        blue:"border-blue-200 bg-blue-50 text-blue-700",
        purple:"border-purple-200 bg-purple-50 text-purple-700",
        emerald:"border-emerald-200 bg-emerald-50 text-emerald-700",
   };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0}}
            transition={{ delay, duration: 0.4}}
            className="flex flex-col items-center"
        >
            <div className={cn(`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 shadow-sm bg-white ${colorStyles[color].replace('bg-','text-')}`)}>
                <Icon className={cn(`w-5 h-5`)} />
            </div>

            <Card className="w-48 shadow-lg border-t-4 border-t-transparent hover:border-t-primary transition-all">
                <div className={cn(`px-3 py-2 border-b flex items-center justify-between bg-slate-50/50 rounded-t-lg`)}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
                    <div className={cn(`w-2 h-2 rounded-full ${colorStyles[color].split('')[2].replace('text-','bg-')}`)}></div>
                </div>
                <div className="p-3 text-center">
                    {children}
                </div>
            </Card>
        </motion.div>
    );
}

function FlowConnection({ active}: { active: boolean}) {
    return (
        <div className="w-16 h-px bg-slate-300 relative mx-2">
            {active && (
                <motion.div
                    className="absolute top-1/2 left-0 w-2 h-2 bg-slate-400 rounded-full -mt-1"
                    animate={{ left:"100%"}}
                    transition={{ duration: 1.5, repeat: Infinity, ease:"linear"}}
                />
            )}
            <ArrowRight className="absolute -right-3 -top-3 w-6 h-6 text-slate-300" />
        </div>
    );
}
