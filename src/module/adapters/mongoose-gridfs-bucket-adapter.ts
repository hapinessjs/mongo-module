import * as mongoose from 'mongoose';
import * as mongo from 'mongodb';

import { Observable } from 'rxjs/Observable';
import { HapinessMongoAdapter } from './hapiness-mongo-adapter';
import { Debugger } from '../shared';

const __debugger = new Debugger('MongooseGridfsBucketAdapter');

(<any>mongoose).Promise = global.Promise;

export class MongooseGridFsBucketAdapter extends HapinessMongoAdapter {
    private _gridfsBucket: mongo.GridFSBucket;

    public static getInterfaceName(): string {
        return 'mongoose-gridfs-bucket';
    }

    constructor(options) {
        super(options);
    }

    protected _tryConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = false;

                const connectOptions: mongoose.ConnectionOptions = {
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

    protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._gridfsBucket = new mongoose.mongo.GridFSBucket((<mongoose.Connection>this._connection).db);

                this.onConnected().subscribe(_ => {
                    __debugger.debug('_afterConnect', '(subscribe) On connected success');
                }, (e) => {
                    __debugger.debug('_afterConnect', `(subscribe) On connected failed ${JSON.stringify(e, null, 2)}`);
                });

                this._connection.once('error', err =>
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

    public registerValue(schema: any, collection: string, collectionName?: string) {
        if (!!collectionName && collectionName.length) {
            return this._connection.model(collection, schema, collectionName);
        }
        return this._connection.model(collection, schema);
    }

    public getLibrary(): any {
        return this._gridfsBucket;
    }

    // It seems that there is a bug here and it never really close the connection it always try to reconnect afterwards.
    public close(): Observable<void> {
        return Observable.fromPromise(this._connection.client.close(true));
    }
}
