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

import { MongooseAdapter } from '../../src';

@suite('- Unit MongooseAdapterTest file')
export class MongooseAdapterTest {

    private _mongooseAdapter: MongooseAdapter;
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
        this._mongooseAdapter = new MongooseAdapter({ host: 'test.in.tdw', db: 'test', skip_connect: true });
        this._mockConnection = MongooseMockInstance.mockCreateConnection();
    }

    /**
     * Function executed after each test
     */
    after() {
        MongooseMockInstance.restore();

        this._mongooseAdapter = undefined;
        this._mockConnection = undefined;
    }

    /**
     * Static method getInterfaceName should return correct key
     */
    @test('- Static method getInterfaceName should return correct key')
    testGetInterfaceNameReturnValue() {
        unit
            .string(MongooseAdapter.getInterfaceName())
            .is('mongoose');
    }

    /**
     * Get library should return mongoose instance
     */
    @test('- Get library should return mongoose instance')
    testGetLibraryShouldReturnInstance() {
        const _mongoose = this._mongooseAdapter.getLibrary();
        const _test = _mongoose.createConnection();

        unit.assert(_test instanceof ConnectionMock);
    }

    /**
     *  If db already exists it should call `close()` function on it
     */
    @test('- If db already exists it should call `close()` function on it')
    testIfDbAlreadyExistsItShouldCloseIt(done) {
        const spy = unit.spy();

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
                this._db = { close: spy };
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                unit.assert(spy.callCount === 1, `Incorrect call count on spy, expected 1 but it was ${spy.callCount}`);
                done();
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     * If connection got an error the observer should failed and return the error
     */
    @test('- If connection got an error the observer should failed and return the error')
    testConnectionGotErrorObserverShouldFail(done) {
        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('error', 400, new Error('Custom error, connection failed'));

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                unit.assert(false);
                done();
            }, (err) => {
                unit.string(err.message).is('Custom error, connection failed')
                done();
            });
    }


    @test('- registerValue')
    testRegisterValue() {
        const adapter = new MongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        adapter['_connection'] = {
            model: (_, doc) => doc
        };
        unit
            .must(adapter.registerValue(123, 'test'))
            .is(123);
    }

    @test('- registerValue with collectionName')
    testRegisterValueWithCollectionName() {
        const adapter = new MongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        adapter['_connection'] = {
            model: (_, doc, name) => name
        };
        unit
            .string(adapter.registerValue(123, 'test', 'test2'))
            .is('test2');
    }

    /**
     *  If the connection emit the event connected, the _tryConnect function should resolve observable
     */
    @test('- If the connection emit the event connected, the _tryConnect function should resolve observable')
    testConnectionSucceedObserverShouldResolve(done) {
        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                done();
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     *  When afterConnect got an error after calling the onConnected function, it should pass in the error block
     */
    @test('- When afterConnect got an error after calling the onConnected function, it should pass in the error block')
    testAfterConnectOnConnectedFailShouldGoInErrorBlock(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            onConnected() {
                return Observable.create(
                    observer => {
                        observer.error(new Error('test error'));
                        observer.complete();

                        done();
                    }
                );
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('error', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     * When afterConnect got error, the onError function should be called
     */
    @test('- When afterConnect got error, the onError function should be called')
    testAfterConnectGotConnectionError(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            protected onError() {
                return Observable.create(
                    observer => {
                        observer.next();
                        observer.complete();

                        done();
                    }
                )
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('error', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     * When afterConnect got error, the onError function should be called and go to the error block of observer if there was an error
     */
    @test('- When afterConnect got error, the onError function should be called and go to the error block of observer if there is an error')
    testAfterConnectGotConnectionErrorGoToObservableErrBlock(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            protected onError() {
                return Observable.create(
                    observer => {
                        observer.error(new Error('test error'));
                        observer.complete();

                        done();
                    }
                )
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('error', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     * When afterConnect got disconnected, the onDisconnected function should be called
     */
    @test('- When afterConnect got disconnected, the onDisconnected function should be called')
    testAfterConnectGotConnectionDisconnected(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            protected onDisconnected() {
                return Observable.create(
                    observer => {
                        observer.next();
                        observer.complete();

                        done();
                    }
                )
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('disconnected', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     * If afterConnect got disconnected, onDisconnected function should be called and go to the error block of observer if there is an err
     */
    @test('- If afterConnect got disconnected, onDisconnected func should be called and go to the err block of observer if there is an err')
    testAfterConnectGotConnectionDisconnectedGoToObservableErrBlock(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            protected onDisconnected() {
                return Observable.create(
                    observer => {
                        observer.error(new Error('test error'));
                        observer.complete();

                        done();
                    }
                )
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('disconnected', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    /**
     *  Close
     */
    @test('- Close')
    testClose(done) {
        this._mockConnection.db = {
            close: unit.stub()
        };

        this._mockConnection.db.close.returns(Promise.resolve(null))

        const mockConnection = this._mockConnection;

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .flatMap(() => _tmpObject.close())
            .subscribe(_ => {
                unit.bool(this._mockConnection.db.close.calledOnce).isTrue();
                done();
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }
}
