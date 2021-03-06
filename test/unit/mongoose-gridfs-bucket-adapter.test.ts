/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';
import * as mongoose from 'mongoose';

import { Observable } from 'rxjs/Observable';

import { MongooseMockInstance, ConnectionMock } from '../mocks';

import { MongooseGridFsBucketAdapter } from '../../src';

@suite.skip('- Unit MongooseGridfsBucketAdapterTest file')
export class MongooseGridFsBucketAdapterTest {
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
     * Static method getInterfaceName should return correct key
     */
    @test('- Static method getInterfaceName should return correct key')
    testGetInterfaceNameReturnValue() {
        unit
            .string(MongooseGridFsBucketAdapter.getInterfaceName())
            .is('mongoose-gridfs-bucket');
    }

    /**
     * If connection got an error the observer should failed and return the error
     */
    @test('- If connection got an error the observer should failed and return the error')
    testConnectionGotErrorObserverShouldFail(done) {
        MongooseMockInstance.restore();
        this._mockConnection = MongooseMockInstance.mockThrowCreateConnection(new Error('Custom error, connection failed'));

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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
    @test.skip('- If the connection emit the event connected, the _tryConnect function should resolve observable')
    testConnectionSucceedObserverShouldResolve(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect().do(() => {
                    this._connection = mockConnection;
                });
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        this._mockConnection.emitAfter('connected', 400);

        _tmpObject.on('connected', () => done());
        _tmpObject
            .publicTryConnect()
            .subscribe(_ => {}, (err) =>
                done(err));
    }

    /**
     *  If the connection emit the event connected, the afterConnect function should go though success block
     */
    @test('- If the connection emit the event connected, the onConnected function inside afterConnect should resolve observable')
    testConnectionSucceedOnConnectedInsideAfterConnect(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));
        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
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

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('connected', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    @test('- When afterConnect got an error after calling the onConnected function, it should pass in the error to on error event')
    testAfterConnectOnConnectedFailShouldGoInErrorBlock(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));

        let i = 0;

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            onConnected() {
                if (i === 0) {
                    i++;
                    return Observable.create(
                        observer => {
                            observer.error(new Error('test error'));
                        }
                    );
                }
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject.once('error', err => {
            unit.object(err).isInstanceOf(Error).hasProperty('message', 'test error');
            done();
        });

        _tmpObject
            .publicAfterConnect()
            .subscribe(
                _ => {},
                (err) => done(err)
            );
    }

    @test.skip('- When afterConnect got error, the on error event should be called')
    testAfterConnectGotConnectionError(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            onError(err?: any) {
                return Observable.of(null).do(() => done());
            }

        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('error', 400);
            }, (err) => done(err));
    }

    @test.skip('- When afterConnect got error, the on error event should be called')
    testAfterConnectGotConnectionErrorGoToObservableErrBlock(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject.on('error', () => done());
        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('error', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    @test.skip('- When afterConnect got disconnected, the on disconnected event should be called')
    testAfterConnectGotConnectionDisconnected(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }

            onDisconnected() {
                return Observable.of(null).do(() => done());
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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
        const adapter = new MongooseGridFsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        adapter['_connection'] = {
            model: (_, doc) => doc
        };
        unit
            .must(adapter.registerValue(123, 'test'))
            .is(123);
    }

    @test('- registerValue with collectionName')
    testRegisterValueWithCollectionName() {
        const adapter = new MongooseGridFsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
        adapter['_connection'] = {
            model: (_, doc, name) => name
        };
        unit
            .string(adapter.registerValue(123, 'test', 'test2'))
            .is('test2');
    }

    @test('- getLibrary')
    testGetLibrary(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
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

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                unit.object(_tmpObject.getLibrary()).isInstanceOf(mongoose.mongo.GridFSBucket);
                this._mockConnection.emitAfter('connected', 400);
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }

    @test('- close')
    testClose(done) {
        const mockConnection = this._mockConnection;
        mockConnection.db = new mongoose.mongo.Db('dbname', new mongoose.mongo.Server('fake.host.in.tdw', 4242));
        const stub = unit.stub().returns(Promise.resolve(null));
        (<any>mockConnection).client = {
            close: stub
        };

        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicAfterConnect() {
                this._connection = mockConnection;
                return this._afterConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', skip_connect: true });

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
