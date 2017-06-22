import { IHapinessMongoAdapterConstructorArgs } from '../adapters/index';

export const defaultMongoConfig: IHapinessMongoAdapterConstructorArgs = {
    db: 'default_db',
    host: '127.0.0.1',
    port: 27017
};
