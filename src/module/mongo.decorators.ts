import {
    CoreDecorator,
    createDecorator,
    extractMetadata
} from '@hapiness/core/core';

import { ConnectionOptions } from './services';

export interface MongoModel {
    adapter: string;
    collection: string;
    options?: any;
}

export const MongoModel: CoreDecorator<MongoModel> = createDecorator<MongoModel>('MongoModel', {
    adapter: undefined,
    collection: undefined,
    options: undefined
});

export abstract class Model {
    protected connectionOptions: ConnectionOptions;
    abstract readonly schema: any;
    constructor(token: any) {
        const metadata: MongoModel = extractMetadata(token);
        this.connectionOptions = {
            adapter: metadata.adapter,
            options: metadata.options
        }
    }
}
