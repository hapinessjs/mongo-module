import { UtilFunctions } from '../utils/index';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs';


export interface IHapinessMongoAdapterConstructorArgs {
    db?: string;
    database?: string;
    host?: string;
    port?: number;
    instance?: number;
    url?: string;
    is_ready?: boolean;
    is_mocking?: boolean;
    multi?: boolean;
}

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

        this._config = !!options ?
            options :
            (
                process.env.NODE_ENV === 'test' ?
                    { is_mocking: true } :
                    undefined
            );

        // It means we're not on test environment but we dont get any config!
        if (!this._config) {
            throw new Error('Missing mongodb configuration');
        }

        this._isReady = false;

        this.connect().subscribe(_ => { }, (err) => { });
    }

    private connect(): Observable<void> {
        this._connection = null;

        if (this._config.is_mocking) {
            this._uri = `mongodb://localhost/unit_test_${new Date().getTime()}_${process.pid}`;
            return this._mock();
        }

        const db = this._config.db || this._config.database;

        if (this._config.url) {
            this._uri = UtilFunctions.getMongoUri(this._config.url, db);
        } else {
            this._uri = `mongodb://${this._config.host}:${this._config.port || 27017}/${db}`;
        }

        return this._tryConnect();
    }

    /*
     *
     *  This function can be overriden by all inherited classes.
     *
     */
    protected _mock(): Observable<void> {
        throw new Error('Not implemented');
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    protected _tryConnect(): Observable<void> {
        throw new Error('Not implemented');
    }

    /*
     *
     *  This function should be overriden by all inherited classes.
     *
     */
    protected _afterConnect(): Observable<void> {
        throw new Error('Not implemented');
    }

    protected onConnected(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = true;
                this.emit('ready');

                observer.next();
                observer.complete();
            });
    }

    protected onDisconnected(): Observable<void> {
        this.emit('disconnected');
        return this
            ._tryConnect()
            .delay(5000);
    }

    protected onError(err): Observable<void> {
        return this
            ._tryConnect()
            .delay(5000);
    }

    public whenReady(options: { timeout: number }): Observable<void> {
         return Observable
            .create(observer => {
                if (this._isReady) {
                    observer.next();
                    observer.complete();
                }

                this.on('ready', () => {
                    observer.next();
                    observer.complete();
                });
            })
            .timeout(options.timeout || 60000);
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
