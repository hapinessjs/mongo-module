/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Hapiness, HapinessModule, OnStart, Inject } from '@hapiness/core';
import { HttpServerExt, Server } from '@hapiness/core/extensions/http-server';

import { Observable } from 'rxjs/Observable';

// Mongoose mocking
import { MongooseMockInstance, ConnectionMock } from '../mocks';

// element to test
import {
    HapinessMongoAdapter,
    MongoClientExt,
    MongoManager,
    MongoModule,
    MongoClientService
} from '../../src';

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
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                const mongooseAdapter = this._mongoManager.getAdapter('mongoose');
                try {
                    unit
                        .string(mongooseAdapter.getUri())
                        .is('mongodb://my.hostname.com:27017/unit_test');

                    this._httpServer.stop().then(__ => done()).catch(err => done(err));
                } catch (err) {
                    this._httpServer.stop().then(__ => done(err)).catch(e => done(e));
                }
            }
        }

        Hapiness.bootstrap(MMTest, [
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
    @test('- Test if `MongoModule` can register a custom provider and if we can get it with its connection uri')
    testMongoModuleCustomAdapter(done) {
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


        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                const customAdapter = this._mongoManager.getAdapter('custom');
                try {
                    unit
                        .string(customAdapter.getUri())
                        .is('mongodb://my.hostname.com:27017/unit_test');

                    this._httpServer.stop().then(__ => done()).catch(err => done(err));
                } catch (err) {
                    this._httpServer.stop().then(__ => done(err)).catch(e => done(e));
                }
            }
        }

        Hapiness.bootstrap(MMTest, [
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
                }],
            }),
        ]);
    }

    /**
     * Trying to register an existing Adapter should lead to an error
     */
    @test('- Trying to register an existing Adapter should lead to an error')
    testMongoModuleRegisterExistingAdapter(done) {
        class MongooseAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'mongoose';
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
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                this
                    ._httpServer
                    .stop()
                    .then(__ => done(new Error('Should not go there')))
                    .catch(err => done(err));
            }
        }

        Hapiness.bootstrap(MMTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt.setConfig({
                common: {
                    host: 'my.hostname.com',
                    port: 27017,
                    db: 'unit_test'
                },
                register: [ MongooseAdapter ],
                load: [{
                    name: 'custom',
                    config: {}
                }],
            }),
        ])
        .catch(err => {
            Hapiness['extensions']
                .find(ext => ext.token === HttpServerExt)
                .value
                .stop()
                .then(__ => done())
                .catch(e => done(e));
        });
    }

    /**
     * We can add MongoModule without loading any adapters
     */
    @test('- We can add MongoModule without loading any adapters')
    testMongoModuleWithoutLoadingAdapters(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                this._httpServer.stop().then(__ => done()).catch(err => done(err));
            }
        }

        Hapiness.bootstrap(MMTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt.setConfig({
                common: {
                    host: 'my.hostname.com',
                    port: 27017,
                    db: 'unit_test'
                },
            }),
        ])
        .catch(err => {
            done(err);
        });
    }

    /**
     * We can add MongoModule with empty adapters array to load
     */
    @test('- We can add MongoModule with empty adapters array to load')
    testMongoModuleWithEmptyAdaptersArrayToLoad(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                this._httpServer.stop().then(__ => done()).catch(err => done(err));
            }
        }

        Hapiness.bootstrap(MMTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt.setConfig({
                common: {
                    host: 'my.hostname.com',
                    port: 27017,
                    db: 'unit_test'
                },
                load: []
            }),
        ])
        .catch(err => {
            done(err);
        });
    }

    /**
     * We can add MongoModule without any config
     */
    @test('- We can add MongoModule without any config')
    testMongoModuleWithoutAnyConfig(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                this._httpServer.stop().then(__ => done()).catch(err => done(err));
            }
        }

        Hapiness.bootstrap(MMTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt,
        ])
        .catch(err => {
            done(err);
        });
    }

    /**
     * Loading MongoExt with an unregistered adapter should throw an error
     */
    @test('- Loading MongoExt with an unregistered adapter should throw an error')
    testMongoModuleLoadUnregisterAdapter(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                @Inject(MongoClientExt) private _mongoManager: MongoManager
            ) { }

            onStart(): void {
                this._httpServer.stop()
                    .then(__ => done(new Error('Should not go there')))
                    .catch(err => done(err));
            }
        }

        Hapiness.bootstrap(MMTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt.setConfig({
                load: [{
                    name: 'custom',
                    config: {}
                }],
            }),
        ])
        .catch(err => {
            unit
                .string(err.message)
                .is('Unknown adapter custom, please register it before using it.');

            Hapiness['extensions']
                .find(ext => ext.token === HttpServerExt)
                .value
                .stop()
                .then(__ => done())
                .catch(e => done(e));
        });
    }

    /**
     * We should be able to use the MongoClientService to get the MongoManager
     */
    @test('- We should be able to use the MongoClientService to get the MongoManager')
    testMongoModuleViaMongoClientService(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: [ MongoModule ]
        })
        class MMTest implements OnStart {

            private _mongoManager: MongoManager;

            constructor(
                @Inject(HttpServerExt) private _httpServer: Server,
                private _mongoClientService: MongoClientService
            ) {
                this._mongoManager = _mongoClientService.get();
            }

            onStart(): void {
                unit
                    .bool(this._mongoManager instanceof MongoManager)
                    .isTrue();

                this
                    ._httpServer
                    .stop()
                    .then(__ => done())
                    .catch(err => done(err));
            }
        }

        Hapiness.bootstrap(MMTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            MongoClientExt,
        ])
        .catch(err => {
           done(err);
        });
    }
}
