import { ModelManager } from '../managers/model-manager';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs/Observable';
import { HapinessMongoAdapterConstructorArgs } from './interfaces';
import { UtilFunctions, Debugger } from '../shared';

const __debugger = new Debugger('HapinessMongoAdapter');

/*
 * Not really abstract but we'll simulate it
 */
export class HapinessMongoAdapter extends EventEmitter {
    protected _config: HapinessMongoAdapterConstructorArgs;
    protected _uri: string;
    protected _isReady: boolean;

    protected _connection: any;
    protected _db: any;

    protected _modelManager: ModelManager;

    public static getInterfaceName(): string {
        throw new Error('Your adapter should implements `getInterfaceName()`');
    }

    constructor(options: HapinessMongoAdapterConstructorArgs) {
        super();

        this._config = options;

        // It means we're not on test environment but we dont get any config!
        if (!this._config || !Object.keys(this._config).length) {
            throw new Error('Missing mongodb configuration');
        }

        this._isReady = false;

        if (options.skip_connect) {
            return;
        }

        this._modelManager = new ModelManager();
    }

    public connect(): Observable<void> {
        this._connection = null;
        const db = this._config.db || this._config.database;

        if (this._config.url) {
            this._uri = UtilFunctions.getMongoUri(this._config.url, db);
        } else if (!!db) {
            this._uri = `mongodb://${this._config.host}:${this._config.port || 27017}/${db}`;
        } else {
            return Observable.throw(new Error('No db name nor url provided'));
        }

        return this.tryConnect()
            .do(() => __debugger.debug('connect', 'OK'))
            .catch(err => {
                __debugger.debug('connect', `Err catched :: ${err.message}`);
                __debugger.debug('connect', `Err catched :: ${JSON.stringify(err, null, 2)}`);
                return Observable.throw(err);
            });
    }

    public tryConnect(): Observable<void> {
        __debugger.debug('tryConnect', `connecting to ${UtilFunctions.hideCredentials(this._uri)}`);
        this.emit('connecting', { uri: this._uri });
        return this
            ._tryConnect()
            .switchMap(_ => this._afterConnect());
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    protected _tryConnect(): Observable<void> {
        return Observable
            .throw(new Error('`_tryConnect` is not implemented'));
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    protected _afterConnect(): Observable<void> {
        return Observable
            .throw(new Error('`_afterConnect` is not implemented'));
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    public getLibrary<T = any>(): T {
        throw new Error('`getLibrary` is not implemented');
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    public registerValue(schema: any, collection: string, collectionName?: string): any {
        throw new Error('`registerValue` is not implemented');
    }

    public getModelManager(): ModelManager {
        return this._modelManager;
    }

    protected onConnected(): Observable<void> {
        __debugger.debug('onConnected', '');

        return Observable
            .create(observer => {
                this._isReady = true;
                this.emit('ready');

                observer.next();
                observer.complete();
            });
    }

    protected onDisconnected(): Observable<void> {
        __debugger.debug('onDisconnected', `disconnected from ${UtilFunctions.hideCredentials(this._uri)}`);

        this._isReady = false;
        this.emit('disconnected', { uri: this._uri });

        return this
            .tryConnect()
            .delay(5000);
    }

    protected onError(err?: any): Observable<void> {
        __debugger.debug('onError', `got error :: ${JSON.stringify(err, null, 2)}`);

        this._isReady = false;

        return this
            .tryConnect()
            .delay(5000);
    }

    public whenReady(options: { timeout: number } = { timeout: 60000 }): Observable<void> {
        return Observable
            .create(observer => {
                if (this._isReady) {
                    __debugger.debug('whenReady', 'already ready');

                    observer.next();
                    observer.complete();
                    return;
                }

                this.once('ready', () => {
                    __debugger.debug('whenReady', 'now ready');

                    this._isReady = true;

                    observer.next();
                    observer.complete();
                });
            })
            .timeout(options.timeout);
    }

    public isConnected(): boolean {
        return this.isReady();
    }

    public isReady(): boolean {
        return this._isReady;
    }

    public getUri(): string {
        return this._uri;
    }

    public getConnection<T = any>(): T {
        return this._connection;
    }

    public close(): Observable<void> {
        return Observable.of(null);
    }

}
