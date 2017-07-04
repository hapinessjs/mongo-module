import { Injectable, Inject } from '@hapiness/core';
import { MongoClientExt } from '../mongo.extension';
import { MongoManager } from '../managers';

@Injectable()
export class MongoClientService {
    constructor(
        @Inject(MongoClientExt) private _mongoManager: MongoManager
    ) { }

    get() {
        return this._mongoManager;
    }
}
