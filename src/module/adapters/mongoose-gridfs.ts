import * as mongoose from 'mongoose';
import * as util from 'util';

import { Observable } from 'rxjs/Observable';

import { CreateGridFsStream, GridFsStream } from '../shared/gridfs-stream';
import { HapinessMongoAdapter } from './hapiness-mongo-adapter';

/**
 * Gridfs adapter using mongoose for connection purposes
 *
 * @deprecated
 * @export
 * @class MongooseGridFsAdapter
 * @extends {HapinessMongoAdapter}
 */
export class MongooseGridFsAdapter extends HapinessMongoAdapter {

    private _gridfs: GridFsStream.Grid;
    protected _client: any;

    public static getInterfaceName(): string {
        return 'mongoose-gridfs';
    }

    constructor(options) {
        super(options)
        util.deprecate((() => null), 'MongooseGridFsAdapter is deprecated use MongooseGridfsBucketAdapter instead.')();
    }

    protected _tryConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = false;

                if ((this._db && !this._db.close) || (this._client && !this._client.close)) {
                    return observer.error(new Error('_db or _client needs a close function.'));
                }

                if (this._db && this._db.close) {
                    this._db.close();
                } else if (this._client && this._client.close) {
                    this._client.close();
                }

                const connectOptions = {
                    reconnectTries: Number.MAX_VALUE,
                    reconnectInterval: 5000,
                };

                this._connection = mongoose.createConnection(this._uri, connectOptions);

                // Seems that typings are not up to date at the moment
                this._connection['then'](connection => {
                    observer.next();
                    observer.complete();
                })
                .catch(err => {
                    observer.error(err);
                });
            });
    }

    protected _createGridFsStream(db, mongo) {
        return CreateGridFsStream(db, mongo);
    }

    protected _afterConnect(): Observable<void > {
        return Observable
            .create(observer => {
                this._db = this._connection.db;
                this._client = this._connection.client;

                this._gridfs = this._createGridFsStream(this._db, mongoose.mongo);

                this.onConnected().subscribe(_ => {}, (e) => {});

                this._connection.once('error', err =>
                    this.onError(err).subscribe(_ => {}, (e) => {})
                );

                this._connection.once('disconnected', () =>
                    this.onDisconnected().subscribe(_ => {}, (e) => {})
                );

                observer.next();
                observer.complete();
            });
    }

    public registerValue(schema: any, collection: string, collectionName ?: string) {
        if (!!collectionName && collectionName.length) {
            return this._connection.model(collection, schema, collectionName);
        }
        return this._connection.model(collection, schema);
    }

    public getLibrary(): any {
        return this._gridfs;
    }

    public close(): Observable<void > {
        return Observable.fromPromise(this._client.close());
    }
}
