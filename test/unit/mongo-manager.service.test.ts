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
        this._mongoManagerService = new MongoManagerService();
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
                this._mongoManagerService.getAdapter('mongoose', { dbname: 'toto' })
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
                    () => this._mongoManagerService.getAdapter('test', { dbname: 'toto' }),
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

        class CustomAdapter extends AbstractHapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'mongoose';
            }

            constructor(options) { super(options) }
        }

        unit
                .assert
                .throws(
                    () => this._mongoManagerService.registerAdapter(CustomAdapter),
                    'Provider mongoose already exists.'
                );
    }

    /**
     * Test if `MongoManagerService.registerAdapter(...)` throw an error because we are trying to override an existing adapter'
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
     * Test if we register a custom adapter and we get it twice, we got two different instance'
     */
    @test('- Test if we register a custom adapter and we get it twice, we got two different instance')
    testMongoManagerServiceRegisterAndGetTwiceWithDifferentKey() {

        class CustomAdapter extends AbstractHapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'custom';
            }

            constructor(options) { super(options) }
        }

        // Register custom adapter
        this._mongoManagerService.registerAdapter(CustomAdapter)

        // Get first instance
        const adapter1 = this._mongoManagerService.getAdapter('custom', { dbname: 'toto1' });

        // Get second instance
        const adapter2 = this._mongoManagerService.getAdapter('custom', { dbname: 'toto2' });

        unit
            .bool(
                adapter1.getDbName() === adapter2.getDbName(),
            )
            .isFalse();
    }

    /**
     * Test if we get twice a registered adapter for the same key, we get the exact same instance'
     */
    @test('- Test if we get twice a registered adapter for the same key, we get the exact same instance')
    testMongoManagerServiceRegisterAndGetTwiceWithSameKey() {
        // Get first instance
        const adapter1 = this._mongoManagerService.getAdapter('mongoose', { dbname: 'toto1' });

        // Get second instance
        const adapter2 = this._mongoManagerService.getAdapter('mongoose', { dbname: 'toto1' });

        unit
            .bool(
                adapter1.getDbName() === adapter2.getDbName(),
            )
            .isTrue();
    }
}
