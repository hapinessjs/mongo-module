/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite, only } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Hapiness, HapinessModule, HttpServer, Lib, OnStart } from '@hapiness/core';
import { Observable } from 'rxjs/Observable';

// Mongoose mocking
import { MongooseMockInstance, ConnectionMock } from '../mocks/index';

// element to test
import { AbstractHapinessMongoAdapter, MongoModule, MongoManagerService, MONGO_CONFIG } from '../../src/index';
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
            options: {
                host: '0.0.0.0',
                port: 4443
            },
            providers: [
                {
                    provide: MONGO_CONFIG,
                    useValue: unitTestMongoConfig
                }
            ],
            imports: [
                MongoModule.setConfig(Object.assign({}, unitTestMongoConfig))
            ]
        })
        class MongoModuleTest implements OnStart {
            constructor(private _mongoManager: MongoManagerService) {}

            onStart(): void {
                this
                    ._mongoManager
                    .getAdapter('mongoose')
                    .subscribe(adapter => {
                        try {
                            unit
                                .string(adapter.getUri())
                                .is('mongodb://my.hostname.com:27017/unit_test');

                            Hapiness
                                .kill()
                                .subscribe(__ => done());
                        } catch (err) {
                            Hapiness
                                .kill()
                                .subscribe(__ => done(err));
                        }
                    }, (err) => Hapiness
                        .kill()
                        .subscribe(__ => done(err))
                    );
            }
        }

        Hapiness.bootstrap(MongoModuleTest);
    }

    /**
     * Test if `MongoModule` can register a custom provider and if we can get it with its connection uri
     */
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
            options: {
                host: '0.0.0.0',
                port: 4443
            },
            providers: [
                {
                    provide: MONGO_CONFIG,
                    useValue: unitTestMongoConfig
                }
            ],
            imports: [
                MongoModule.setConfig(Object.assign({}, unitTestMongoConfig))
            ]
        })
        class MongoModuleTest implements OnStart {
            constructor(private _mongoManager: MongoManagerService) {}

            onStart(): void {
                const res = this._mongoManager.registerAdapter(CustomAdapter);

                this
                    ._mongoManager
                    .getAdapter('custom')
                    .subscribe(adapter => {
                        try {
                            unit
                                .string(adapter.getUri())
                                .is('mongodb://my.hostname.com:27017/unit_test');

                            Hapiness
                                .kill()
                                .subscribe(__ => done());
                        } catch (err) {
                            Hapiness
                                .kill()
                                .subscribe(__ => done(err));
                        }
                    }, (err) => Hapiness
                        .kill()
                        .subscribe(__ => done(err))
                    );
            }
        }

        Hapiness.bootstrap(MongoModuleTest);
    }

    // /**
    //  * Test if injected service is an instance of HelloWorldService
    //  */
    // @test('- Injected service must be an instance of `HelloWorldService`')
    // testInjectableHelloWorldService(done) {
    //     @Lib()
    //     class HelloWorldLib {
    //         constructor(private _helloWorldService: HelloWorldService) {
    //             unit.object(this._helloWorldService).isInstanceOf(HelloWorldService)
    //                 .when(_ => Hapiness.kill().subscribe(__ => done()));
    //         }
    //     }

    //     @HapinessModule({
    //         version: '1.0.0',
    //         options: {
    //             host: '0.0.0.0',
    //             port: 4443
    //         },
    //         imports: [
    //             HelloWorldModule
    //         ],
    //         declarations: [
    //             HelloWorldLib
    //         ]
    //     })
    //     class HelloWorldModuleTest {}

    //     Hapiness.bootstrap(HelloWorldModuleTest);
    // }

    // /**
    //  * Test if injected `HelloWorldService` as a `sayHello` function
    //  */
    // @test('- Injected `HelloWorldService` must have `sayHello` function')
    // testInjectableHelloWorldServiceSayHello(done) {
    //     @Lib()
    //     class HelloWorldLib {
    //         constructor(private _helloWorldService: HelloWorldService) {
    //             unit.function(this._helloWorldService.sayHello)
    //                 .when(_ => Hapiness.kill().subscribe(__ => done()));
    //         }
    //     }

    //     @HapinessModule({
    //         version: '1.0.0',
    //         options: {
    //             host: '0.0.0.0',
    //             port: 4443
    //         },
    //         imports: [
    //             HelloWorldModule
    //         ],
    //         declarations: [
    //             HelloWorldLib
    //         ]
    //     })
    //     class HelloWorldModuleTest {}

    //     Hapiness.bootstrap(HelloWorldModuleTest);
    // }

    // /**
    //  * Test if injected `HelloWorldService.sayHello()` function returns an Observable
    //  */
    // @test('- Injected `HelloWorldService.sayHello()` function must return an Observable')
    // testInjectableHelloWorldServiceSayHelloObservable(done) {
    //     @Lib()
    //     class HelloWorldLib {
    //         constructor(private _helloWorldService: HelloWorldService) {
    //             unit.object(this._helloWorldService.sayHello()).isInstanceOf(Observable)
    //                 .when(_ => Hapiness.kill().subscribe(__ => done()));
    //         }
    //     }

    //     @HapinessModule({
    //         version: '1.0.0',
    //         options: {
    //             host: '0.0.0.0',
    //             port: 4443
    //         },
    //         imports: [
    //             HelloWorldModule
    //         ],
    //         declarations: [
    //             HelloWorldLib
    //         ]
    //     })
    //     class HelloWorldModuleTest {}

    //     Hapiness.bootstrap(HelloWorldModuleTest);
    // }

    // /**
    //  * Test if injected `HelloWorldService.sayHello()` Observable returns 'Hello World'
    //  */
    // @test('- Injected `HelloWorldService.sayHello()` Observable function must return a string with `Hello World` value')
    // testInjectableHelloWorldServiceSayHelloObservableReturnString(done) {
    //     @Lib()
    //     class HelloWorldLib {
    //         constructor(private _helloWorldService: HelloWorldService) {
    //             this._helloWorldService.sayHello().subscribe(m => unit.string(m).is('Hello World')
    //                     .when(_ => Hapiness.kill().subscribe(__ => done())));
    //         }
    //     }

    //     @HapinessModule({
    //         version: '1.0.0',
    //         options: {
    //             host: '0.0.0.0',
    //             port: 4443
    //         },
    //         imports: [
    //             HelloWorldModule
    //         ],
    //         declarations: [
    //             HelloWorldLib
    //         ]
    //     })
    //     class HelloWorldModuleTest {}

    //     Hapiness.bootstrap(HelloWorldModuleTest);
    // }
}
