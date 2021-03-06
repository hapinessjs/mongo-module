import { HapinessMongoAdapter } from '../index';
import { HapinessMongoAdapterConstructorArgs } from './hapiness-mongo-adapter-constructor-args';

export interface HapinessLoadAdapterConfig {
    name: string,
    config?: HapinessMongoAdapterConstructorArgs
}

export interface HapinessMongoConfig {
    register?: Array<typeof HapinessMongoAdapter>;
    load?: HapinessLoadAdapterConfig[];
    common?: HapinessMongoAdapterConstructorArgs;
};
