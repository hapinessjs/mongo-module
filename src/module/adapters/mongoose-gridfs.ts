import * as mongoose from 'mongoose';
import { Observable } from 'rxjs';

import { CreateGridFsStream, GridFsStream } from '../shared/gridfs-stream';
import { AbstractHapinessMongoAdapter } from './mongo-adapter.abstract';

export class MongooseGridFsAdapter extends AbstractHapinessMongoAdapter {

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
                    observer.complete();
                });
            });
    }

    protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._db = this._connection.db;

                this._gridfs = CreateGridFsStream(this._db, mongoose.mongo);

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
}
