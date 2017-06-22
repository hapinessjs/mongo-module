/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite, only } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';
import { MongooseMockInstance, ConnectionMock } from '../mocks/index';

import { AbstractHapinessMongoAdapter, MongoManagerService, MongooseAdapter } from '../../src/index';


@suite('- Unit MongoManagerServiceTest file')
class MongoManagerServiceTest {

    // private property to store service instance
    private _mongoManagerService: MongoManagerService;
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
        this._mongoManagerService = new MongoManagerService({ host: 'test.in.tdw' });
        this._mockConnection = MongooseMockInstance.mockCreateConnection();
    }

    /**
     * Function executed after each test
     */
    after() {
        MongooseMockInstance.restore();

        this._mongoManagerService = undefined;
        this._mockConnection = undefined;
    }

    /**
     * Test if `MongoManagerService` as a `sayHello` function
     */
    @test('- `MongoManagerService` must have `getAdapter` function')
    testMongoManagerServiceGetAdapter() {
        unit
            .function(this._mongoManagerService.getAdapter);
    }

    /**
     * Test if `MongoManagerService.getAdapter()` function returns an Observable
     */
    @test('- `MongoManagerService.getAdapter(...)` function must returns an Observable')
    testMongoManagerServiceGetAdapterMongooseAdapterIsObservable() {
        unit
            .object(this
                ._mongoManagerService
                .getAdapter('mongoose')
            )
            .isInstanceOf(Observable);
    }

    /**
     * Test if `MongoManagerService.getAdapter(...).subscribe(...)` function must return an instance of MongooseAdapter
     */
    @test('- `MongoManagerService.getAdapter(...).subscribe(...)` function must return an instance of MongooseAdapter')
    testMongoManagerServiceGetAdapterMongooseAdapterClass(done) {
        this._mockConnection.emitAfter('connected', 400);
        this
            ._mongoManagerService
            .getAdapter('mongoose')
            .subscribe(adapter => {
                unit
                    .object(
                        adapter
                    )
                    .isInstanceOf(MongooseAdapter);

                done();
            }, (err) => done(err));
    }

    /**
     * Test if `MongoManagerService.getAdapter()` function returns an Observable
     */
    @test('- `MongoManagerService.getAdapter(...)` function should throw an error')
    testMongoManagerServiceGetAdapterUnknowAdapter(done) {
        this._mockConnection.emitAfter('connected');
        this
            ._mongoManagerService
            .getAdapter('test', { db: 'toto' })
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
     * Test if `MongoManagerService.registerAdapter(...)` throw an error because the child class dont override getInterfaceName'
     */
    @test('- `MongoManagerService.registerAdapter(...)` throw an error because the child class dont override getInterfaceName')
    testMongoManagerServiceRegisterAdapterThrowErrorMissingFunctionGetInterfaceName() {
        this._mockConnection.emitAfter('connected');

        class CustomAdapter extends AbstractHapinessMongoAdapter {
            constructor(options) { super(options) }
        }

        unit
                .assert
                .throws(
                    () => this._mongoManagerService.registerAdapter(CustomAdapter),
                    (err) => {
                        if ((err instanceof Error) && err.message === 'Your adapter should implements `getInterfaceName()`') {
                            return true;
                        }

                        return false;
                    }
                );
    }

    /**
     * Test if `MongoManagerService.registerAdapter(...)` throw an error because we are trying to override an existing adapter'
     */
    @test('- `MongoManagerService.registerAdapter(...)` throw an error because we are trying to override an existing adapter')
    testMongoManagerServiceRegisterAdapterThrowErrorAdapterAlreadyExists() {
        class CustomMongooseAdapter extends AbstractHapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'mongoose';
            }

            constructor(options) { super(options) }
        }

        unit
                .assert
                .throws(
                    () => this._mongoManagerService.registerAdapter(CustomMongooseAdapter),
                    (err) => {
                        if ((err instanceof Error) && err.message === 'Provider mongoose already exists.') {
                            return true;
                        }

                        return false;
                    }
                );
    }

    /**
     * Test if `MongoManagerService.registerAdapter(...)` should return true'
     */
    @test('- `MongoManagerService.registerAdapter(...)` should return true')
    testMongoManagerServiceRegisterAdapterShouldReturnTrue() {
        class CustomAdapter extends AbstractHapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options) }
        }

        unit
            .bool(
                this._mongoManagerService.registerAdapter(CustomAdapter),
            )
            .isTrue();
    }

    /**
     * Test if we register a custom adapter and we get it twice, we got two different instances'
     */
    @test('- Test if registering, then getting a custom adapter with db name will create the correct URI')
    testMongoManagerServiceRegisterAndGetItForDb(done) {
        class CustomAdapter extends AbstractHapinessMongoAdapter {
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
        this._mongoManagerService.registerAdapter(CustomAdapter);

        this
            ._mongoManagerService
            .getAdapter('custom', { db: 'toto1' })
            .subscribe(adapter => {
                unit
                    .string(adapter.getUri())
                    .is('mongodb://test.in.tdw:27017/toto1');

                done();
            }, (err) => done(err));
    }

    @test('- Test if registering, then getting a custom adapter with database name will create the correct URI')
    testMongoManagerServiceRegisterAndGetItForDatabase(done) {
        class CustomAdapter extends AbstractHapinessMongoAdapter {
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
        this._mongoManagerService.registerAdapter(CustomAdapter);

        this
            ._mongoManagerService
            .getAdapter('custom', { database: 'toto1' })
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
    testMongoManagerServiceRegisterAndGetTwiceWithDifferentKey(done) {
        class CustomAdapter extends AbstractHapinessMongoAdapter {
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
        this._mongoManagerService.registerAdapter(CustomAdapter);

        let adapter1;
        let adapter2;

        this._mockConnection.emitAfter('connected');

        // Get first instance
        this
            ._mongoManagerService
            .getAdapter('custom', { db: 'toto1' })
            .switchMap(adap1 => {
                adapter1 = adap1;
                return this._mongoManagerService.getAdapter('custom', { db: 'toto2' });
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
    testMongoManagerServiceRegisterAndGetTwiceWithSameKey(done) {
        const mongoManagerService = new MongoManagerService({ db: 'toto', host: 'test.in.tdw' });

         this._mockConnection.emitAfter('connected');

        let adapter1;
        let adapter2;

        // Get first instance
        mongoManagerService
            .getAdapter('mongoose')
            .switchMap(adap1 => {
                adapter1 = adap1;
                return mongoManagerService.getAdapter('mongoose');
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
}
