/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite, only } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Hapiness, HapinessModule, Lib, OnStart, Inject } from '@hapiness/core';
import { HttpServerExt, Server } from '@hapiness/core/extensions/http-server';

import { Observable } from 'rxjs/Observable';

// Mongoose mocking
import { MongooseMockInstance, ConnectionMock } from '../mocks/index';

// element to test
import { AbstractHapinessMongoAdapter, MongoClientExt, MongoManagerService, Debugger } from '../../src/index';

import { unitTestMongoConfig } from '../config/index';

@suite('- Integration MongoModule test file')
class MongoModuleTest {
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
        this._mockConnection = MongooseMockInstance.mockCreateConnection();
    }

    /**
     * Function executed after each test
     */
    after() {
        MongooseMockInstance.restore();

        this._mockConnection = undefined;
    }

    /**
     * Test if `MongoModule` has a Mongoose adapter and if we can get the connection URI
     */
    @test('- Test if `MongoModule` has a Mongoose adapter and if we can get the connection URI')
    testMongoModuleMongooseAdapter(done) {
        this._mockConnection.emitAfter('connected', 400);

        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MongoModuleTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManagerService
            ) { }

            onStart(): void {
                const mongooseAdapter = this._mongoManager.getAdapter('mongoose');
                try {
                    unit
                        .string(mongooseAdapter.getUri())
                        .is('mongodb://my.hostname.com:27017/unit_test');

                    this._httpServer.stop().then(__ => done()).catch(err => done(err));
                } catch (err) {
                    this._httpServer.stop().then(__ => done(err)).catch(err => done(err));
                }
            }
        }

        Hapiness.bootstrap(MongoModuleTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt.setConfig({
                common: {
                    host: 'my.hostname.com',
                    port: 27017,
                    db: 'unit_test'
                },
                register: [],
                load: [{
                    name: 'mongoose',
                    config: {}
                }],
            }),
        ]);
    }

    /**
     * Test if `MongoModule` can register a custom provider and if we can get it with its connection uri
     */
    @only
    @test('- Test if `MongoModule` can register a custom provider and if we can get it with its connection uri')
    testMongoModuleCustomAdapter(done) {
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


        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MongoModuleTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManagerService
            ) { }

            onStart(): void {
                const customAdapter = this._mongoManager.getAdapter('custom');
                try {
                    unit
                        .string(customAdapter.getUri())
                        .is('mongodb://my.hostname.com:27017/unit_test');

                    this._httpServer.stop().then(__ => done()).catch(err => done(err));
                } catch (err) {
                    this._httpServer.stop().then(__ => done(err)).catch(err => done(err));
                }
            }
        }

        Hapiness.bootstrap(MongoModuleTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt.setConfig({
                common: {
                    host: 'my.hostname.com',
                    port: 27017,
                    db: 'unit_test'
                },
                register: [CustomAdapter],
                load: [{
                    name: 'custom',
                    config: {}
                }],
            }),
        ]);
    }
}
