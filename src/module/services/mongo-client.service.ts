import { Injectable, Inject, Type } from '@hapiness/core';
import { MongoClientExt } from '../mongo.extension';
import { MongoManager, ModelManager, ModelItem } from '../managers';

@Injectable()
export class MongoClientService {
    constructor(
        @Inject(MongoClientExt) private _mongoManager: MongoManager
    ) { }

    get() {
        return this._mongoManager;
    }

    getDao(adapterName: string) {
        return this
            ._mongoManager
            .getAdapter(adapterName)
            .getLibrary();
    }

    getModels(adapterName: string): ModelManager {
        return this
            ._mongoManager
            .getAdapter(adapterName)
            .getModelManager();
    }

    getModel(adapterName: string, token: Type<any>): any {
        return this
            ._mongoManager
            .getAdapter(adapterName)
            .getModelManager()
            .get(token);
    }
}
