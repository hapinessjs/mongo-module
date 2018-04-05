/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';

import { MongooseMockInstance, GridFsMockInstance, ConnectionMock } from '../mocks';

import { MongooseGridFsAdapter } from '../../src';

@suite('- Unit MongooseGridFsAdapterTest file')
export class MongooseGridFsAdapterTest {
    private _mockConnection: ConnectionMock;
    private _gridfsMock: any;

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
        this._gridfsMock = GridFsMockInstance.mockGridFsStream();
    }

    /**
     * Function executed after each test
     */
    after() {
        MongooseMockInstance.restore();
        GridFsMockInstance.restore();

        this._mockConnection = undefined;
        this._gridfsMock = undefined;
    }

    /**
     * Static method getInterfaceName should return correct key
     */
    @test('- Static method getInterfaceName should return correct key')
    testGetInterfaceNameReturnValue() {
        unit
            .string(MongooseGridFsAdapter.getInterfaceName())
            .is('mongoose-gridfs');
    }

    /**
     *  If db already exists it should call `close()` function on it
     */
    @test('- If db already exists it should call `close()` function on it')
    testIfDbAlreadyExistsItShouldCloseIt(done) {
        const spy = unit.spy();

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
            constructor(opts) {
                super(opts);
                this._db = { close: spy };
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                unit.assert(spy.callCount === 1, `Incorrect call count on spy, expected 1 but it was ${spy.callCount}`);
                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     *  If client already exists it should call `close()` function on it
     */
    @test('- If client already exists it should call `close()` function on it')
    testIfClientAlreadyExistsItShouldCloseIt(done) {
        const spy = unit.spy();

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
            constructor(opts) {
                super(opts);
                this._client = { close: spy };
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                unit.assert(spy.callCount === 1, `Incorrect call count on spy, expected 1 but it was ${spy.callCount}`);
                done();
            }, (err) => {
                done(err);
            });
    }

    /**
     *  If db or client already exists and doesn't have a `close()` function it should throw
     */
    @test('- If db or client already exists and doesn\'t have a `close()` function it should throw')
    testIfDbOrClientAlreadyExistsButHaveNoCloseFunctionShouldThrow(done) {
        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
            constructor(opts) {
                super(opts);
                this._db = {};
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                unit.assert(false);
                done();
            }, (err) => {
                unit.string(err.message).is('_db or _client needs a close function.');
                done();
            });
    }

    /**
     * If connection got an error the observer should failed and return the error
     */
    @test('- If connection got an error the observer should failed and return the error')
    testConnectionGotErrorObserverShouldFail(done) {
        MongooseMockInstance.restore();
        this._mockConnection = MongooseMockInstance.mockThrowCreateConnection(new Error('Custom error, connection failed'));

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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

    /**
     *  If the connection emit the event connected, the _tryConnect function should resolve observable
     */
    @test('- If the connection emit the event connected, the _tryConnect function should resolve observable')
    testConnectionSucceedObserverShouldResolve(done) {
        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
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
     *  If the connection emit the event connected, the afterConnect function should go though success block
     */
    @test('- If the connection emit the event connected, the onConnected function inside afterConnect should resolve observable')
    testConnectionSucceedOnConnectedInsideAfterConnect(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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
                        observer.next();
                        observer.complete();

                        done();
                    }
                );
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('connected', 400);
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
        const gridfsMock = this._gridfsMock;

        const mockConnection = this._mockConnection;

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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
                        unit.assert(gridfsMock.callCount === 1, `Incorrect call count, expected 1 but it was ${gridfsMock.callCount}`);
                    }
                );
            }

            onError() {
                return Observable.create(observer => {
                    observer.next();
                    observer.complete();
                    done();
                })
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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
     * If afterConnect got disconnected, onDisconnected
    function should be called and go to the error block of observer if there is an err
     */
    @test('- If afterConnect got disconnected, onDisconnected func should be called and go to the err block of observer if there is an err')
    testAfterConnectGotConnectionDisconnectedGoToObservableErrBlock(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('disconnected', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    @test('- registerValue')
    testRegisterValue() {
        const adapter = new MongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        adapter['_connection'] = {
            model: (_, doc) => doc
        };
        unit
            .must(adapter.registerValue(123, 'test'))
            .is(123);
    }

    @test('- registerValue with collectionName')
    testRegisterValueWithCollectionName() {
        const adapter = new MongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        adapter['_connection'] = {
            model: (_, doc, name) => name
        };
        unit
            .string(adapter.registerValue(123, 'test', 'test2'))
            .is('test2');
    }

    @test('- getLibrary')
    testGetLibrary(done) {
        this._mockConnection.db = 'toto';
        const mockConnection = this._mockConnection;

        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
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
                        observer.next();
                        observer.complete();

                        done();
                    }
                );
            }

            protected _createGridFsStream(db, mongo) {
                return <any>'test';
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                unit.value(_tmpObject.getLibrary()).is('test');
                this._mockConnection.emitAfter('connected', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    @test('- close')
    testClose(done) {
        const stub = unit.stub().returns(Promise.resolve(null));

        const mockConnection = this._mockConnection;
        (<any>mockConnection).client = {
            close: stub
        }


        class ExtendMongooseGridFsAdapter extends MongooseGridFsAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridFsAdapter({ host: 'test.in.tdw', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .flatMap(() => _tmpObject.close())
            .subscribe(_ => {
                unit.bool(stub.calledOnce).isTrue();
                done();
            }, (err) => {
                done(err);
            });
    }
}
