import { EventEmitter } from 'events';
import { Observable } from 'rxjs';
import { IHapinessMongoAdapterConstructorArgs } from './interfaces';
import { UtilFunctions, Debugger } from '../shared/index';

const __debugger = new Debugger('AbstractHapinessMongoAdapter');

/*
 * Not really abstract but we'll simulate it
 */
export class AbstractHapinessMongoAdapter extends EventEmitter {
    protected _config: IHapinessMongoAdapterConstructorArgs;
    protected _uri: string;
    protected _isReady: boolean;

    protected _connection: any;
    protected _db: any;

    public static getInterfaceName(): string {
        throw new Error('Your adapter should implements `getInterfaceName()`');
    }

    constructor(options: IHapinessMongoAdapterConstructorArgs) {
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

        this
            .connect()
            .subscribe(_ => {
                __debugger.debug('constructor', 'OK');
            }, (err) => {
                __debugger.debug('constructor', `Err catched :: ${JSON.stringify(err, null, 2)}`);
            });
    }

    public connect(): Observable<void> {
        this._connection = null;

        const db = this._config.db || this._config.database;

        if (this._config.url) {
            this._uri = UtilFunctions.getMongoUri(this._config.url, db);
        } else if (!!db) {
            this._uri = `mongodb://${this._config.host}:${this._config.port || 27017}/${db}`;
        } else {
            return Observable.throw(new Error('No db name provided'));
        }

        return this.tryConnect();
    }

    public tryConnect(): Observable<void> {
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
        return Observable.throw(new Error('`_tryConnect` is not implemented'));
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    protected _afterConnect(): Observable<void> {
        return Observable.throw(new Error('`_afterConnect` is not implemented'));
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    public getLibrary(): any {
        throw new Error('`getLibrary` is not implemented');
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
        __debugger.debug('onDisconnected', '');

        this.emit('disconnected');

        return this
            .tryConnect()
            .delay(5000);
    }

    protected onError(err?: any): Observable<void> {
        __debugger.debug('onError', `got error :: ${JSON.stringify(err, null, 2)}`);

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

}
