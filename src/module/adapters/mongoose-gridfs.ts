import * as mongoose from 'mongoose';
import * as util from 'util';

import { CreateGridFsStream, GridFsStream } from '../shared/gridfs-stream';
import { MongooseAdapter } from './mongoose-adapter';

/**
 * Gridfs adapter using mongoose for connection purposes
 *
 * @deprecated
 * @export
 * @class MongooseGridFsAdapter
 * @extends {HapinessMongoAdapter}
 */
export class MongooseGridFsAdapter extends MongooseAdapter {

    private _gridfs: GridFsStream.Grid;
    protected _client: any;

    public static getInterfaceName(): string {
        return 'mongoose-gridfs';
    }

    constructor(options) {
        super(options)
        util.deprecate((() => null), 'MongooseGridFsAdapter is deprecated use MongooseGridfsBucketAdapter instead.')();

        this.on('connected', () => {
            this._gridfs = this._createGridFsStream(this._connection.db, mongoose.mongo);
        });
    }

    protected _createGridFsStream(db, mongo) {
        return CreateGridFsStream(db, mongo);
    }

    public getLibrary<T = GridFsStream.Grid>(): T {
        return <any>this._gridfs;
    }
}
