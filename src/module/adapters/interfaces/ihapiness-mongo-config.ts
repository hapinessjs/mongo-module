import { AbstractHapinessMongoAdapter } from '../index';
import { IHapinessMongoAdapterConstructorArgs } from './ihapiness-mongo-adapter';

export interface IHapinessLoadAdapterConfig {
    name: string,
    config: IHapinessMongoAdapterConstructorArgs
}

export interface IHapinessMongoConfig {
    register?: Array<typeof AbstractHapinessMongoAdapter>;
    load?: IHapinessLoadAdapterConfig[];
    common?: IHapinessMongoAdapterConstructorArgs;
};
