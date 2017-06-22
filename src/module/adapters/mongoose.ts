import * as mongoose from 'mongoose';

import { Observable } from 'rxjs';
import { AbstractHapinessMongoAdapter } from './mongo-adapter.abstract';
import { Debugger } from '../shared/index';

const __debugger = new Debugger('MongooseAdapter');

export class MongooseAdapter extends AbstractHapinessMongoAdapter {

    public static getInterfaceName(): string {
        return 'mongoose';
    }

    constructor(options) {
        super(options);
    }

    protected _tryConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = false;

                if (this._db) {
                    __debugger.debug('_tryConnect', 'db already exists');
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
                    __debugger.debug('_tryConnect', 'connection once connected');

                    observer.next();
                    observer.complete();
                });

                this._connection.once('error', err => {
                    __debugger.debug('_tryConnect', `connection once error ${JSON.stringify(err, null, 2)}`);

                    observer.error(err);
                    observer.complete();
                });
            });
    }

    protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._db = this._connection.db;

                this.onConnected().subscribe(_ => {
                    __debugger.debug('_afterConnect', '(subscribe) On connected success');
                }, (e) => {
                    __debugger.debug('_afterConnect', `(subscribe) On connected failed ${JSON.stringify(e, null, 2)}`);
                });

                this._connection.on('error', err =>
                    this.onError(err).subscribe(_ => {
                        __debugger.debug('_afterConnect', '(subscribe) On connection error #success');
                    }, (e) => {
                        __debugger.debug('_afterConnect', `(subscribe) On connection error #failed ${JSON.stringify(e, null, 2)}`);
                    })
                );

                this._connection.once('disconnected', () =>
                    this.onDisconnected().subscribe(_ => {
                        __debugger.debug('_afterConnect', '(subscribe) On connection disconnected #success');
                    }, (e) => {
                        __debugger.debug('_afterConnect', `(subscribe) On connection disconnected #failed ${JSON.stringify(e, null, 2)}`);
                    })
                );

                observer.next();
                observer.complete();
            });
    }

    public getLibrary(): any {
        return mongoose;
    }
}
