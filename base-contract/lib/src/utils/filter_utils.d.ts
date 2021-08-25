import { IndexedFilterValues } from '@0x/types';
import { BlockRange, ContractAbi, EventAbi, FilterObject, LogEntry } from 'ethereum-types';
export declare const filterUtils: {
    generateUUID(): string;
    getFilter<ContractEvents extends string>(address: string, eventName: ContractEvents, indexFilterValues: IndexedFilterValues, abi: ContractAbi, blockRange?: BlockRange | undefined): FilterObject;
    getEventSignatureFromAbiByName(eventAbi: EventAbi): string;
    getTopicsForIndexedArgs(abi: EventAbi, indexFilterValues: IndexedFilterValues): Array<string | null>;
    matchesFilter(log: LogEntry, filter: FilterObject): boolean;
    doesMatchTopics(logTopics: string[], filterTopics: Array<string[] | string | null>): boolean;
    matchesTopic(logTopic: string, filterTopic: string[] | string | null): boolean;
};
//# sourceMappingURL=filter_utils.d.ts.map