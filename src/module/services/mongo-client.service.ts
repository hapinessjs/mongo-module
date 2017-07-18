import { Injectable, Inject, Type } from '@hapiness/core';
import { MongoClientExt } from '../mongo.extension';
import { MongoManager, ModelManager, ModelItem } from '../managers';

export interface ConnectionOptions {
    adapter: string;
    options?: any;
}

@Injectable()
export class MongoClientService {
    constructor(
        @Inject(MongoClientExt) private _mongoManager: MongoManager
    ) { }

    get() {
        return this._mongoManager;
    }

    getDao(connectionOptions: ConnectionOptions) {
        connectionOptions = Object.assign({}, connectionOptions);
        const adapter = this._mongoManager
            .getAdapter(connectionOptions.adapter, connectionOptions.options);
        return adapter ? adapter.getLibrary() : undefined;
    }

    getModels(connectionOptions: ConnectionOptions): ModelManager {
        connectionOptions = Object.assign({}, connectionOptions);
        const adapter = this._mongoManager
            .getAdapter(connectionOptions.adapter, connectionOptions.options);
        return adapter ? adapter.getModelManager() : undefined;
    }

    getModel(connectionOptions: ConnectionOptions, token: Type<any>): any {
        connectionOptions = Object.assign({}, connectionOptions);
        const adapter = this._mongoManager
            .getAdapter(connectionOptions.adapter, connectionOptions.options);
        return adapter ? adapter.getModelManager().get(token) : undefined;
    }
}
