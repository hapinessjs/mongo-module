import { Injectable, Inject, Optional } from '@hapiness/core';
import { MongoClientExt } from '../mongo.extension';
import { MongoManager } from '../managers/index';

@Injectable()
export class MongoClientService {
    constructor(
        @Inject(MongoClientExt) private _mongoManager: MongoManager
    ) { }

    get() {
        return this._mongoManager;
    }
}
