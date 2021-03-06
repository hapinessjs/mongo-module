/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';

import { HapinessMongoAdapter } from '../../src';


@suite.skip('- Unit AbstractMongoAdapterTest file')
export class AbstractMongoAdapterTest {

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
    before() {}

    /**
     * Function executed after each test
     */
    after() {}

    /**
     * Instantiate class without any config should throw an error
     */
    @test('- Instantiate class without any config should throw an error')
    testInstantiateWithoutConfigShouldThrow() {
        unit
            .assert
            .throws(
                () => new HapinessMongoAdapter(null),
                (err) => {
                    if (err.message === 'Missing mongodb configuration') {
                        return true;
                    }
                    return false;
                }
            )
    }

    /**
     * Instantiate class with an empty config should throw an error
     */
    @test('- Instantiate class with an empty config should throw an error')
    testInstantiateWithEmptyConfigShouldThrow() {
        unit
            .assert
            .throws(
                () => new HapinessMongoAdapter({}),
                (err) => {
                    if (err.message === 'Missing mongodb configuration') {
                        return true;
                    }
                    return false;
                }
            )
    }

    /**
     * If no db or database are given it should not affect an uri (cause the observable were rejected)
     */
    @test('- If no db or database are given it should throw an error')
    testConfigNoDbNoDatabaseShouldThrow(done) {
        const adapter = new HapinessMongoAdapter({ host: 'test.in.tdw' });

        adapter
            .connect()
            .subscribe(_ => {
                done(new Error('Should not go there !'));
            }, err => {
                unit
                    .string(err.message)
                    .is('No db name nor url provided');

                done();
            });
    }

    /**
     * Calling parent _tryConnect() should throw an error
     */
    @test('- Calling parent _tryConnect() should throw an error')
    testCallingParentTryConnectShouldThrow(done) {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) { super(options); }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });
        adapter
            .tryConnect()
            .subscribe(_ => {
                done(new Error('Should not go there !'));
            }, err => {
                unit
                    .string(err.message)
                    .is('`_tryConnect` is not implemented');

                done();
            });
    }

    /**
     * Calling parent _afterConnect() should throw an error
     */
    @test('- Calling parent _afterConnect() should throw an error')
    testCallingParentAfterConnectShouldThrow(done) {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            protected _tryConnect() {
                return Observable
                    .create(observer => {
                        observer.next();
                        observer.complete();
                    });
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });
        adapter
            .tryConnect()
            .subscribe(_ => {
                done(new Error('Should not go there !'));
            }, err => {
                unit
                    .string(err.message)
                    .is('`_afterConnect` is not implemented');

                done();
            });
    }

    /**
     * Calling parent getLibrary() should throw an error
     */
    @test('- Calling parent getLibrary() should throw an error')
    testCallingParentGetLibraryShouldThrow() {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });
        unit
            .assert
            .throws(
                () => adapter.getLibrary(),
                (err) => {
                    if (err.message === '`getLibrary` is not implemented') {
                        return true;
                    }
                    return false;
                }
            );
    }

    /**
     * Calling parent getLibrary() should throw an error
     */
    @test('- Calling parent registerValue() should throw an error')
    testCallingParentRegisterValueShouldThrow() {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });
        unit
            .assert
            .throws(
                () => adapter.registerValue(null, null),
                (err) => {
                    if (err.message === '`registerValue` is not implemented') {
                        return true;
                    }
                    return false;
                }
            );
    }

    /**
     * Calling onConnected should make the adapter ready
     */
    @test('- Calling onConnected should make the adapter ready')
    testCallingOnConnectedShouldMakeAdapterReady(done) {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            callOnConnected(): Observable<void> {
                return this.onConnected();
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });

        adapter
            .callOnConnected()
            .subscribe(_ => {
                unit
                    .bool(adapter.isReady())
                    .isTrue();

                unit
                    .bool(adapter.isConnected())
                    .isTrue();

                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     * Calling onConnected should call try connect
     */
    @test('- Calling onDisconnected should call try connect')
    testCallingOnDisconnectedShouldCallTryConnect(done) {
        let hasBeenCalled = false;

        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            tryConnect() {
                return Observable.create(observer => {
                    hasBeenCalled = true;

                    observer.next();
                    observer.complete();
                });
            }

            callOnDisconnected(): Observable<void> {
                return this.onDisconnected();
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });

        adapter
            .callOnDisconnected()
            .subscribe(_ => {
                unit
                    .bool(hasBeenCalled)
                    .isTrue();

                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     * Calling getConnection should return the value of the connection
     */
    @test('- Calling getConnection should return the value of the connection')
    testCallGetConnection() {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
                this._connection = 'the_connection';
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test', skip_connect: true });

        unit
            .string(adapter.getConnection())
            .is('the_connection');
    }

    /**
     * Calling onError should call try connect
     */
    @test('- Calling onError should call try connect')
    testCallingOnErrorShouldCallTryConnect(done) {
        let hasBeenCalled = false;

        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            tryConnect() {
                return Observable.create(observer => {
                    hasBeenCalled = true;

                    observer.next();
                    observer.complete();
                });
            }

            callOnError(): Observable<void> {
                return this.onError();
            }
        }

        const adapter = new TestAdapter({ host: 'test.in.tdw', db: 'test' });

        adapter
            .callOnError()
            .subscribe(_ => {
                unit
                    .bool(hasBeenCalled)
                    .isTrue();

                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     * Calling connect with an uri should use UtilFunctions.getMongoUri to format it
     */
    @test('- Calling connect with an uri should use UtilFunctions.getMongoUri to format it')
    testCallingConnectWithAnUri(done) {
        let hasBeenCalled = false;

        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            tryConnect() {
                return Observable.create(observer => {
                    hasBeenCalled = true;

                    observer.next();
                    observer.complete();
                });
            }
        }

        const adapter = new TestAdapter({ skip_connect: true, url: 'this.is.a.fake.uri' });

        adapter
            .connect()
            .subscribe(_ => {
                unit
                    .bool(hasBeenCalled)
                    .isTrue();

                unit
                    .string(adapter.getUri())
                    .is('this.is.a.fake.uri')

                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     * Calling whenReady and not having ready bool set to true yet so emiting "ready" event
     */
    @test('- Calling whenReady and not having ready set to true yet so emiting "ready" event')
    testWhenReadyDelayed(done) {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            _tryConnect() {
                return Observable.create(observer => {
                    observer.next();
                    observer.complete();
                });
            }

            _afterConnect() {
                return Observable.create(observer => {
                    observer.next();
                    observer.complete();
                });
            }
        }

        const adapter = new TestAdapter({ skip_connect: true, url: 'this.is.a.fake.uri' });
        setTimeout(() => adapter.emit('ready'), 1000);

        adapter
            .connect()
            .flatMap(() => adapter.whenReady())
            .subscribe(_ => {
                unit.bool(adapter.isReady()).isTrue();
                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     * Calling when ready and not having ready set to true yet so emiting "ready" event
     */
    @test('- Calling _tryConnect and failing to connect should pass in the error cb of subscribe')
    testThrowOnTryConnect(done) {
        class TestAdapter extends HapinessMongoAdapter {
            constructor(options) {
                super(options);
            }

            _tryConnect() {
                return Observable.create(observer => {
                    observer.error(new Error('Try connect errored'));
                    observer.complete();
                });
            }
        }

        const adapter = new TestAdapter({ skip_connect: true, url: 'this.is.a.fake.uri' });

        adapter
            .connect()
            .flatMap(() => adapter.whenReady())
            .subscribe(_ => {
                unit.assert(false);
                done(new Error('should not pass here'));
            }, (err) => {
                unit
                    .string(err.message)
                    .is('Try connect errored');

                done();
            });
    }

    /**
     *  Close
     */
    @test('- Close')
    testClose(done) {
        const _tmpObject = new HapinessMongoAdapter({ host: 'test.in.tdw', skip_connect: true });
        unit.spy(_tmpObject, 'close');

        _tmpObject
            .close()
            .subscribe(_ => {
                unit.bool((_tmpObject.close as any).calledOnce).isTrue();
                done();
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }
}
