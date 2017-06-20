/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';

// element to test
import { AbstractHapinessMongoAdapter, MongoManagerService, MongooseAdapter } from '../../src';


@suite('- Unit MongoManagerServiceTest file')
class MongoManagerServiceTest {
    // private property to store service instance
    private _mongoManagerService: MongoManagerService;

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
    }

    /**
     * Function executed after each test
     */
    after() {
        this._mongoManagerService = undefined;
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
    @test('- `MongoManagerService.getAdapter(...)` function must return an instance of MongooseAdapter with db toto')
    testMongoManagerServiceGetAdapterMongooseAdapterClassDbToto() {
        unit
            .object(
                this._mongoManagerService.getAdapter('mongoose', { db: 'toto' })
            )
            .isInstanceOf(MongooseAdapter);
    }

    /**
     * Test if `MongoManagerService.getAdapter()` function returns an Observable
     */
    @test('- `MongoManagerService.getAdapter(...)` function must return an instance of MongooseAdapter with db default')
    testMongoManagerServiceGetAdapterMongooseAdapterClassDbDefault() {
        unit
            .object(
                this._mongoManagerService.getAdapter('mongoose', {})
            )
            .isInstanceOf(MongooseAdapter);
    }

    /**
     * Test if `MongoManagerService.getAdapter()` function returns an Observable
     */
    @test('- `MongoManagerService.getAdapter(...)` function should throw an error')
    testMongoManagerServiceGetAdapterUnknowAdapter() {
            unit
                .assert
                .throws(
                    () => this._mongoManagerService.getAdapter('test', { db: 'toto' }),
                    'Unknown adapter, please register it before using it.'
                );
    }

    /**
     * Test if `MongoManagerService.registerAdapter(...)` throw an error because the child class dont override getInterfaceName'
     */
    @test('- `MongoManagerService.registerAdapter(...)` throw an error because the child class dont override getInterfaceName')
    testMongoManagerServiceRegisterAdapterThrowErrorMissingFunctionGetInterfaceName() {
        class CustomAdapter extends AbstractHapinessMongoAdapter {
            constructor(options) { super(options) }
        }

        unit
                .assert
                .throws(
                    () => this._mongoManagerService.registerAdapter(CustomAdapter),
                    'Your adapter should implements `getInterfaceName()`'
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
                    'Provider mongoose already exists.'
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

            protected _mock(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _tryConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _afterConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }
        }

        unit
            .bool(
                this._mongoManagerService.registerAdapter(CustomAdapter),
            )
            .isTrue();
    }

    /**
     * Test if we register a custom adapter and we get it twice, we got two different instance'
     */
    @test('- Test if we register a custom adapter and we get it twice, we got two different instance')
    testMongoManagerServiceRegisterAndGetTwiceWithDifferentKey() {
        class CustomAdapter extends AbstractHapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options) }

            protected _mock(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _tryConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }

            protected _afterConnect(): Observable<void> {
                return Observable.create(observer => { observer.next(); observer.complete(); })
            }
        }

        // Register custom adapter
        this._mongoManagerService.registerAdapter(CustomAdapter)

        // Get first instance
        const adapter1 = this._mongoManagerService.getAdapter('custom', { db: 'toto1' });

        // Get second instance
        const adapter2 = this._mongoManagerService.getAdapter('custom', { db: 'toto2' });

        unit
            .bool(
                adapter1.getUri() === adapter2.getUri(),
            )
            .isFalse();
    }

    /**
     * Test if we get twice a registered adapter for the same key, we get the exact same instance'
     */
    @test('- Test if we get twice a registered adapter for the same key, we get the exact same instance')
    testMongoManagerServiceRegisterAndGetTwiceWithSameKey() {
        const mongoManagerService = new MongoManagerService({ db: 'toto', host: 'test.in.tdw' });

        // Get first instance
        const adapter1 = mongoManagerService.getAdapter('mongoose');

        // Get second instance
        const adapter2 = mongoManagerService.getAdapter('mongoose');

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
    }
}
