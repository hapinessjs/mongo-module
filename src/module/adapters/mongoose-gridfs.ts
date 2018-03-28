import * as mongoose from 'mongoose';
import { Observable } from 'rxjs/Observable';

import { CreateGridFsStream, GridFsStream } from '../shared/gridfs-stream';
import { HapinessMongoAdapter } from './hapiness-mongo-adapter';

export class MongooseGridFsAdapter extends HapinessMongoAdapter {

    private _gridfs: GridFsStream.Grid;

    public static getInterfaceName(): string {
        return 'mongoose-gridfs';
    }

    constructor(options) {
        super(options);
    }

    protected _tryConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = false;

                if (this._db && !this._db.close) {
                    return observer.error(new Error('_db needs a close function.'));
                }

                if (this._db) {
                    this._db.close();
                }

                const connectOptions = {
                    server: {
                        reconnectTries: Number.MAX_VALUE,
                        reconnectInterval: 5000,
                    },
                };

                this._connection = mongoose.createConnection(this._uri, connectOptions);

                this._connection.once('connected', () => {
                    observer.next();
                    observer.complete();
                });

                this._connection.once('error', err => {
                    observer.error(err);
                });
            });
    }

    protected _createGridFsStream(db, mongo) {
        return CreateGridFsStream(db, mongo);
    }

    protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._db = this._connection.db;

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

    public registerValue(schema: any, collection: string, collectionName?: string) {
        if (!!collectionName && collectionName.length) {
            return this._connection.model(collection, schema, collectionName);
        }
        return this._connection.model(collection, schema);
    }

    public getLibrary(): any {
        return this._gridfs;
    }

    public close(): Observable<void> {
        return Observable.fromPromise(this._db.close());
    }
}
