import { IHapinessMongoAdapterConstructorArgs } from '../../src/index';

export const unitTestMongoConfig: IHapinessMongoAdapterConstructorArgs = {
    db: 'unit_test',
    url: 'mongodb://my.hostname.com:27017'
};
