import * as mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import { Observable } from 'rxjs';
import { AbstractHapinessMongoAdapter } from './mongo-adapter.abstract';

export class MongooseAdapter extends AbstractHapinessMongoAdapter {

    public static getInterfaceName(): string {
        return 'mongoose';
    }

    constructor(options) {
        super(options);
    }

    protected _mock(): Observable<void> {
        return Observable
            .create(observer => {
                const mockgoose: Mockgoose = new Mockgoose(mongoose);

                mockgoose
                    .prepareStorage()
                    .then(() => {
                        mongoose.connect(this._uri);

                        this._connection = mongoose.connection;

                        observer.next();
                        observer.complete();
                    });
            })
            .map(_ => this._afterConnect());
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
            })
            .map(_ => this._afterConnect());
    }

    protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._db = this._connection.db;

                this.onConnected().subscribe(_ => {}, (e) => {});

                this._connection.on('error', err =>
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
