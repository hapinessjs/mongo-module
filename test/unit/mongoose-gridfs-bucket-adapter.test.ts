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

@suite('- Unit MongooseGridfsBucketAdapterTest file')
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
    @test('- If the connection emit the event connected, the _tryConnect function should resolve observable')
    testConnectionSucceedObserverShouldResolve(done) {
        class ExtendMongooseGridfsBucketAdapter extends MongooseGridFsBucketAdapter {
            constructor(opts) {
                super(opts);
            }

            publicTryConnect() {
                return this._tryConnect();
            }
        }

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });
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

    /**
     *  When afterConnect got an error after calling the onConnected function, it should pass in the error block
     */
    @test('- When afterConnect got an error after calling the onConnected function, it should pass in the error block')
    testAfterConnectOnConnectedFailShouldGoInErrorBlock(done) {
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
                        observer.error(new Error('test error'));
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

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

        _tmpObject
            .publicAfterConnect()
            .subscribe(_ => {
                this._mockConnection.emitAfter('error', 400);
            }, (err) => {
                done(err);
            });
    }

    /**
     * When afterConnect got error, the onError function should be called
     */
    @test('- When afterConnect got error, the onError function should be called')
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

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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
    @test
    ('- When afterConnect got error, the onError function should be called and go to the error block of observer if there is an error')
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

        const _tmpObject = new ExtendMongooseGridfsBucketAdapter({ host: 'test.in.tdw', db: 'unit_test', skip_connect: true });

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

    /**
     * If afterConnect got disconnected, onDisconnected
    function should be called and go to the error block of observer if there is an err
     */
    @test('- If afterConnect got disconnected, onDisconnected func should be called and go to the err block of observer if there is an err')
    testAfterConnectGotConnectionDisconnectedGoToObservableErrBlock(done) {
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
        (<any>mockConnection).client = {
            close: unit.stub()
        };
        (<any>mockConnection).client.close.returns(Promise.resolve(null));

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
                unit.bool((<any>mockConnection).client.close.calledOnce).isTrue();
                done();
            }, (err) => {
                unit.assert(false);
                done(err);
            });
    }
}
