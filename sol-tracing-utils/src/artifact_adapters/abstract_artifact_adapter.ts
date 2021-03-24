import { ContractData } from '../types';

export abstract class AbstractArtifactAdapter {
    public abstract collectContractsDataAsync(): Promise<ContractData[]>;
}
