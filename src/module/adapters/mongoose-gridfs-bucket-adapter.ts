import * as mongoose from 'mongoose';
import * as mongo from 'mongodb';

import { MongooseAdapter } from './mongoose-adapter';

(<any>mongoose).Promise = global.Promise;

export class MongooseGridFsBucketAdapter extends MongooseAdapter {
    private _gridfsBucket;

    public static getInterfaceName(): string {
        return 'mongoose-gridfs-bucket';
    }

    constructor(options) {
        super(options);

        this.on('connected', () => {
            this._gridfsBucket = new mongoose.mongo.GridFSBucket((<mongoose.Connection>this._connection).db);
        });
    }

    public getLibrary<T = mongo.GridFSBucket>(): T {
        return <any>this._gridfsBucket;
    }
}
