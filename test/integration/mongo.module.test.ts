
/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Hapiness, HapinessModule, OnStart, Inject, HttpServerExt, Server } from '@hapiness/core';

import { Observable } from 'rxjs/Observable';

// Mongoose mocking
import { MongooseMockInstance, ConnectionMock } from '../mocks';

// element to test
import {
    HapinessMongoAdapter,
    MongoClientExt,
    MongoManager,
    MongoModule,
    MongoClientService,
    MongoModel,
    Model,
    ModelManager
} from '../../src';

@suite('- Integration MongoModule test file')
export class MongoModuleTest {
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
     * Test if `MongoModule` can register with only a connection uri
     */
    @test('- Test if `MongoModule` can register with only a connection uri')
    testMongoModuleOnlyConnectionUri(done) {
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
                        .is('mongodb://my.hostname.com:27017/my_db');

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
                    url: 'mongodb://my.hostname.com:27017/my_db',
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
    @test.skip('- Trying to register an existing Adapter should lead to an error')
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
                @Inject(HttpServerExt) private _httpServer: Server
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
        .catch(() => {
            if (Hapiness['extensions']) { Hapiness['extensions']
                .find(ext => ext.token === HttpServerExt)
                .value
                .stop()
                .then(__ => done())
                .catch(e => done(e));
            } else {
                done()
            }
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
                @Inject(HttpServerExt) private _httpServer: Server
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
                @Inject(HttpServerExt) private _httpServer: Server
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
                @Inject(HttpServerExt) private _httpServer: Server
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
    @test.skip('- Loading MongoExt with an unregistered adapter should throw an error')
    testMongoModuleLoadUnregisterAdapter(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: []
        })
        class MMTest implements OnStart {
            constructor(
                @Inject(HttpServerExt) private _httpServer: Server
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
                .is('[MongoClientExt] Unknown adapter custom, please register it before using it.');

            if (Hapiness['extensions']) {
                Hapiness['extensions']
                    .find(ext => ext.token === HttpServerExt)
                    .value
                    .stop()
                    .then(__ => done())
                    .catch(e => done(e));
            } else {
                done()
            }
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
                this._mongoManager = this._mongoClientService.get();
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

    @test('- We should be able to store mongo document and get it')
    testMongoDocument(done) {
        this._mockConnection.emitAfter('connected', 400);

        @MongoModel({
            adapter: 'mongoose',
            collection: 'MyCollection',
            options: { database: 'test_1', host: 'host_1' }
        })
        class MyModel extends Model {

            readonly schema;

            constructor(mongoService: MongoClientService) {
                super(MyModel);
                const dao = mongoService.getDao(this.connectionOptions);
                this.schema = new dao.Schema({
                    id: String
                });
            }

        }

        @HapinessModule({
            version: '1.0.0',
            declarations: [ MyModel ],
            imports: [ MongoModule ]
        })
        class MMTest implements OnStart {

            constructor(private _mongoClientService: MongoClientService) {}

            onStart(): void {
                const conn = { adapter: 'mongoose', options: { database: 'test_1', host: 'host_1' }};
                unit
                    .bool(this._mongoClientService.getStore(conn) instanceof ModelManager)
                    .isTrue();

                unit
                    .object(this._mongoClientService.getModel(conn, MyModel).obj)
                    .hasProperty('id');

                conn.options = { database: 'test_2', host: 'host_2' };

                unit
                    .must(this._mongoClientService.getModel(conn, MyModel))
                    .is(undefined);

                unit
                    .must(this._mongoClientService.getStore(null))
                    .is(undefined);

                unit
                    .must(this._mongoClientService.getModel(null, null))
                    .is(undefined);

                unit
                    .must(this._mongoClientService.getDao(null))
                    .is(undefined);

                done();
            }
        }

        Hapiness.bootstrap(MMTest, [
            MongoClientExt.setConfig({
                load: [
                    {
                        name: 'mongoose',
                        config: { database: 'test_1', host: 'host_1' }
                    } ,
                    {
                        name: 'mongoose',
                        config: { database: 'test_2', host: 'host_2' }
                    }
                ],
            })
        ])
        .catch(err => {
           done(err);
        });
    }

    @test('- When OnShutdown is called it should call the close method of every adapter')
    testOnShutdown(done) {
        this._mockConnection.emitAfter('connected', 400);

        this._mockConnection.db = {
            close: unit.stub()
        };

        this._mockConnection.db.close.returns(Promise.resolve(null))

        const mockConnection = this._mockConnection;

        class MockAdapter extends HapinessMongoAdapter {
            public static getInterfaceName(): string {
                return 'mock-adapter';
            }

            constructor(opts) {
                super(opts);
            }

            public _tryConnect() {
                this._isReady = true;
                return Observable.of(null);
            }

            public _afterConnect() {
                return Observable.of(null);
            }

            public getLibrary(): any {
                return 'plop';
            }

            public registerValue(document, collection): any {
                return null;
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }
        }

        class MockAdapter2 extends MockAdapter {
            public static getInterfaceName(): string {
                return 'mock-adapter2';
            }

            constructor(opts) {
                super(opts);
            }
        }

        class MockAdapter3 extends MockAdapter {
            public static getInterfaceName(): string {
                return 'mock-adapter3';
            }

            constructor(opts) {
                super(opts);
            }
        }
        @HapinessModule({
            version: '1.0.0',
            declarations: [ ],
            imports: [ MongoModule ]
        })
        class MMTest implements OnStart {

            onStart(): void {
                const mongoExt: MongoClientExt = Hapiness['extensions'].find(ext => ext.token === MongoClientExt);
                const adapterCloseSpies = Object.values(mongoExt['value']['_adaptersInstances'])
                    .map(adapter => unit.spy(adapter, 'close'));

                mongoExt['instance']
                    .onShutdown()
                    .resolver
                    .subscribe(null, err => done(err), () => {
                        unit.number(adapterCloseSpies.length).is(3);
                        adapterCloseSpies.forEach(spy => unit.bool(spy.calledOnce).isTrue());
                        done();
                    });
            }
        }

        Hapiness.bootstrap(MMTest, [
            MongoClientExt.setConfig({
                register: [ MockAdapter, MockAdapter2, MockAdapter3 ],
                load: [
                    {
                        name: 'mock-adapter',
                        config: { url: 'mongodb://127.0.0.1:27017' }
                    },
                    {
                        name: 'mock-adapter2',
                        config: { url: 'mongodb://127.0.0.1:27017' }
                    },
                    {
                        name: 'mock-adapter3',
                        config: { url: 'mongodb://127.0.0.1:27017' }
                    }
                ],
            })
        ])
        .catch(err => {
           done(err);
        });
    }
}
