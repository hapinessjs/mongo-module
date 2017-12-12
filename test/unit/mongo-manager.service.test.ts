/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';
import { MongooseMockInstance, ConnectionMock } from '../mocks';

import { HapinessMongoAdapter, MongoManager, MongooseAdapter } from '../../src';


@suite('- Unit MongoManagerTest file')
export class MongoManagerTest {

    // private property to store service instance
    private _mongoManager: MongoManager;
    private _mockConnection: ConnectionMock;

    /**
     * Function executed before the suite
     */
    static before() {}

    /**
     * Function executed after the suite
     */
    static after() {}

    /**
     * Class constructor
     * New lifecycle
     */
    constructor() {}

    /**
     * Function executed before each test
     */
    before() {
        this._mongoManager = new MongoManager({ host: 'test.in.tdw' });
        this._mockConnection = MongooseMockInstance.mockCreateConnection();
    }

    /**
     * Function executed after each test
     */
    after() {
        MongooseMockInstance.restore();

        this._mongoManager = undefined;
        this._mockConnection = undefined;
    }

    /**
     * Test if `MongoManager` as a `sayHello` function
     */
    @test('- `MongoManager` must have `getAdapter` function')
    testMongoManagerGetAdapter() {
        unit
            .function(this._mongoManager.getAdapter);
    }

    /**
     * Test if `MongoManager.getAdapter()` function returns an Observable
     */
    @test('- `MongoManager.getAdapter(...)` function must returns an Observable')
    testMongoManagerGetAdapterMongooseAdapterIsObservable() {
        unit
            .object(this
                ._mongoManager
                .loadAdapter('mongoose')
            )
            .isInstanceOf(Observable);
    }

    /**
     * Test if `MongoManager.getAdapter(...).subscribe(...)` function must return an instance of MongooseAdapter
     */
    @test('- `MongoManager.getAdapter(...).subscribe(...)` function must return an instance of MongooseAdapter')
    testMongoManagerGetAdapterMongooseAdapterClass(done) {
        this._mockConnection.emitAfter('connected', 400);
        this
            ._mongoManager
            .loadAdapter('mongoose', { db: 'unit_test' })
            .subscribe(adapter => {
                unit
                    .object(adapter)
                    .isInstanceOf(MongooseAdapter);

                done();
            }, (err) => done(err));
    }

    /**
     * Test if `MongoManager.getAdapter()` function returns an Observable
     */
    @test('- `MongoManager.getAdapter(...)` function should throw an error')
    testMongoManagerGetAdapterUnknowAdapter(done) {
        this._mockConnection.emitAfter('connected');
        this
            ._mongoManager
            .loadAdapter('test', { db: 'toto' })
            .subscribe(_ => {
                done(new Error('Should not go there !'));
            }, (err) => {
                unit
                    .string(err.message)
                    .is('Unknown adapter test, please register it before using it.');

                done();
            });
    }

    /**
     * Test if `MongoManager.registerAdapter(...)` throw an error because the child class dont override getInterfaceName'
     */
    @test('- `MongoManager.registerAdapter(...)` throw an error because the child class dont override getInterfaceName')
    testMongoManagerRegisterAdapterThrowErrorMissingFunctionGetInterfaceName() {
        this._mockConnection.emitAfter('connected');

        class CustomAdapter extends HapinessMongoAdapter {
            constructor(options) { super(options) }
        }

        unit
                .assert
                .throws(
                    () => this._mongoManager.registerAdapter(CustomAdapter),
                    (err) => {
                        if ((err instanceof Error) && err.message === 'Your adapter should implements `getInterfaceName()`') {
                            return true;
                        }

                        return false;
                    }
                );
    }

    /**
     * Test if `MongoManager.registerAdapter(...)` throw an error because we are trying to override an existing adapter'
     */
    @test('- `MongoManager.registerAdapter(...)` throw an error because we are trying to override an existing adapter')
    testMongoManagerRegisterAdapterThrowErrorAdapterAlreadyExists() {
        class CustomMongooseAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'mongoose';
            }

            constructor(options) { super(options) }
        }

        unit
                .assert
                .throws(
                    () => this._mongoManager.registerAdapter(CustomMongooseAdapter),
                    (err) => {
                        if ((err instanceof Error) && err.message === 'Provider mongoose already exists.') {
                            return true;
                        }

                        return false;
                    }
                );
    }

    /**
     * Test if `MongoManager.registerAdapter(...)` should return true'
     */
    @test('- `MongoManager.registerAdapter(...)` should return true')
    testMongoManagerRegisterAdapterShouldReturnTrue() {
        class CustomAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options) }
        }

        unit
            .bool(
                this._mongoManager.registerAdapter(CustomAdapter),
            )
            .isTrue();
    }

    /**
     * Test if we register a custom adapter and we get it twice, we got two different instances'
     */
    @test('- Test if registering, then getting a custom adapter with db name will create the correct URI')
    testMongoManagerRegisterAndGetItForDb(done) {
        class CustomAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options); }

            protected _tryConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _afterConnect(): Observable<void> {
                return this.onConnected();
            }
        }

        // Register custom adapter
        this._mongoManager.registerAdapter(CustomAdapter);

        this
            ._mongoManager
            .loadAdapter('custom', { db: 'toto1' })
            .subscribe(adapter => {
                unit
                    .string(adapter.getUri())
                    .is('mongodb://test.in.tdw:27017/toto1');

                done();
            }, (err) => done(err));
    }

    @test('- Test if registering, then getting a custom adapter with database name will create the correct URI')
    testMongoManagerRegisterAndGetItForDatabase(done) {
        class CustomAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options); }

            protected _tryConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _afterConnect(): Observable<void> {
                return this.onConnected();
            }
        }

        // Register custom adapter
        this._mongoManager.registerAdapter(CustomAdapter);

        this
            ._mongoManager
            .loadAdapter('custom', { database: 'toto1' })
            .subscribe(adapter => {
                unit
                    .string(adapter.getUri())
                    .is('mongodb://test.in.tdw:27017/toto1');

                done();
            }, (err) => done(err));
    }

    /**
     * Test if we register a custom adapter and we get it twice, we got two different instances'
     */
    @test('- Test if we register a custom adapter and we get it twice, we got two different instances')
    testMongoManagerRegisterAndGetTwiceWithDifferentKey(done) {
        class CustomAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options); this._uri = options.db; }

            protected _tryConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _afterConnect(): Observable<void> {
                return this.onConnected();
            }
        }

        // Register custom adapter
        this._mongoManager.registerAdapter(CustomAdapter);

        let adapter1;
        let adapter2;

        this._mockConnection.emitAfter('connected');

        // Get first instance
        this
            ._mongoManager
            .loadAdapter('custom', { db: 'toto1' })
            .switchMap(adap1 => {
                adapter1 = adap1;
                return this._mongoManager.loadAdapter('custom', { db: 'toto2' });
            })
            .subscribe(adap2 => {
                adapter2 = adap2;
                unit
                    .bool(
                        adapter1.getUri() === adapter2.getUri(),
                    )
                    .isFalse();

                done();
            }, (err) => done(err));
    }

    /**
     * Test if we get twice a registered adapter for the same key, we get the exact same instance'
     */
    @test('- Test if we get twice a registered adapter for the same key, we get the exact same instance')
    testMongoManagerRegisterAndGetTwiceWithSameKey(done) {
        const mongoManager = new MongoManager({ db: 'toto', host: 'test.in.tdw' });

         this._mockConnection.emitAfter('connected');

        let adapter1;
        let adapter2;

        // Get first instance
        mongoManager
            .loadAdapter('mongoose')
            .switchMap(adap1 => {
                adapter1 = adap1;
                return mongoManager.loadAdapter('mongoose');
            })
            .subscribe(adap2 => {
                try {
                    adapter2 = adap2;

                    unit
                        .string(
                            adapter1.getUri()
                        )
                        .is('mongodb://test.in.tdw:27017/toto');

                    unit
                        .bool(
                            adapter1.getUri() === adapter2.getUri(),
                        )
                        .isTrue();

                    done();
                } catch (err) {
                    done(err);
                }
            }, (err) => done(err));
    }

    /**
     * Test function _keyForAdapter
     */
    @test('- Test function _keyForAdapter')
    testKeyForAdapter() {
        class MyMongoManager extends MongoManager {
            constructor(opts) {
                super(opts);
            }
            keyForAdapter(adapter: string, options: any) {
                return this._keyForAdapter(adapter, options);
            }
        }

        const mongoManager = new MyMongoManager({ db: 'toto', host: 'test.in.tdw' });

        unit.value(mongoManager.keyForAdapter('mongoose', { test: 'micro' })).is('mongoose');
        unit.value(mongoManager.keyForAdapter('mongoose', { db: 'micro' })).is('mongoose_micro');
        unit.value(mongoManager.keyForAdapter('mongoose', { db: 'micro', instance: 1 })).is('mongoose_micro_1');
        unit.value(mongoManager.keyForAdapter('mongoose', { url: 'mongodb://xxxxxx:30153/test' }))
            .is('mongoose_mongodb://xxxxxx:30153/test');
    }

}
