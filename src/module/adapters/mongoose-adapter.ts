import * as mongoose from 'mongoose';
import { Connection, Mongoose } from 'mongoose';

import { Observable } from 'rxjs/Observable';
import { HapinessMongoAdapter } from './hapiness-mongo-adapter';
import { Debugger, UtilFunctions } from '../shared';

const __debugger = new Debugger('MongooseAdapter');

(<any>mongoose).Promise = global.Promise;

export class MongooseAdapter extends HapinessMongoAdapter {

    public static getInterfaceName(): string {
        return 'mongoose';
    }

    constructor(options) {
        super(options);

        this.on('error', (...args) => __debugger.debug('on#error', JSON.stringify(args)));
    }

    protected _tryConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = false;

                const connectOptions: mongoose.ConnectionOptions = {
                    promiseLibrary: global.Promise,
                    reconnectTries: Number.MAX_VALUE,
                    reconnectInterval: 5000,
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useFindAndModify: false
                };

                this._connection = mongoose.createConnection(this._uri, connectOptions);

                this._connection.on('connected', () => {
                    __debugger.debug('on#connected', `connected to ${UtilFunctions.hideCredentials(this._uri)}`);
                    this.emit('connected', { uri: this._uri });
                });

                this._connection.on('reconnectFailed', () => {
                    __debugger.debug('on#reconnectFailed', `reconnectFailed on ${UtilFunctions.hideCredentials(this._uri)}`);
                    this.emit('reconnectFailed', { uri: this._uri });
                });

                // Seems that typings are not up to date at the moment
                this._connection['then'](() => {
                    observer.next();
                    observer.complete();
                })
                .catch(err => observer.error(err));
            });
    }

    protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this.onConnected().subscribe(_ => {
                    __debugger.debug('_afterConnect', '(subscribe) On connected success');
                }, (e) => {
                    __debugger.debug('_afterConnect', `(subscribe) On connected failed ${JSON.stringify(e, null, 2)}`);
                    this.emit('error', e);
                    this.onError(e).subscribe();
                });

                this._connection.on('error', (e) => {
                    this.emit('error', e);
                    this.onError(e).subscribe();
                });

                this._connection.on('disconnected', () => {
                    __debugger.debug('on#disconnected', `disconnected from ${UtilFunctions.hideCredentials(this._uri)}`);
                    this.emit('disconnected', { uri: this._uri });
                    this.onDisconnected().subscribe();
                });

                observer.next();
                observer.complete();
            });
    }

    public getLibrary<T = Mongoose>(): T {
        return <any>mongoose;
    }

    public getConnection<T = Connection>(): T {
        return this._connection;
    }

    public registerValue(schema: any, collection: string, collectionName?: string) {
        try {
            if (collectionName && collectionName.length) {
                return this._connection.model(collection, schema, collectionName);
            }
            return this._connection.model(collection, schema);
        } catch (err) {
            return this._connection.model(collection);
        }
    }

    public close(): Observable<void> {
        this._isClosed = true;
        return Observable.fromPromise(this._connection.client.close());
    }
}
