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
     * If connection got an error the observer should failed and return the error
     */
    @test('- If connection got an error the observer should failed and return the error')
    testConnectionGotErrorObserverShouldFail(done) {
        MongooseMockInstance.restore();
        this._mockConnection = MongooseMockInstance.mockThrowCreateConnection(new Error('Custom error, connection failed'));

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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

    @test('- Test getConnection method')
    testGetConnectionMethod(done) {
        const mockConnection = this._mockConnection;
        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect().do(() => {
                    this._connection = mockConnection;
                });
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {
                unit.object(_tmpObject.getConnection()).is(mockConnection);
                done();
            }, (err) => done(err));
    }

    @test('- Test reconnectFailed event')
    testReconnectFailedEvent(done) {
        const mockConnection = this._mockConnection;
        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect().do(() => {
                    this._connection = mockConnection;
                });
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        const spy = unit.spy(mockConnection, 'on');
        this._mockConnection.emitAfter('reconnectFailed', 400);
        _tmpObject.on('reconnectFailed', () => {
            unit.number(spy.callCount).isGreaterThan(0);
            done();
        });
        _tmpObject.publicTryConnect().subscribe(() => {}, err => done(err));
    }

    /**
     *  Close
     */
    @test('- Close')
    testClose(done) {
        const stub = unit.stub().returns(Promise.resolve(null));

        const mockConnection = this._mockConnection;
        (<any>mockConnection).client = {
            close: stub
        }

        class ExtendMongooseAdapter extends MongooseAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }
        }

        const _tmpObject = new ExtendMongooseAdapter({ host: 'test.in.tdw', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .flatMap(() => _tmpObject.close())
            .subscribe(_ => {
                unit.bool(stub.calledOnce).isTrue();
                done();
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }
}
