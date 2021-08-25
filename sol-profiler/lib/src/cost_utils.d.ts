import { TraceInfo } from '@0x/sol-tracing-utils';
export declare const costUtils: {
    reportCallDataCost(traceInfo: TraceInfo): number;
    reportMemoryCost(traceInfo: TraceInfo): number;
    reportCopyingCost(traceInfo: TraceInfo): number;
    reportOpcodesCost(traceInfo: TraceInfo): number;
    _printMemoryCost(highestMemoryLocationAccessed?: number | undefined): number;
};
//# sourceMappingURL=cost_utils.d.ts.map