import * as unit from 'unit.js';
import * as mongoose from 'mongoose';

import { EventEmitter } from 'events';

export class ConnectionMock extends EventEmitter {
    private _db: any;

    emitAfter(evt: string, delay?: number, objectToSend?: any) {
        setTimeout(() => {
            if (!!objectToSend) {
                this.emit(evt, objectToSend);
            } else {
                this.emit(evt);
            }
        }, delay || 200);
    }

    get db(): any {
        return this._db;
    }

    set db(theDb: any) {
        this._db = theDb;
    }

    model(collection: string, schema: any) {
        return schema;
    }
}

export class MongooseMock {
    private _mocks;

    constructor() {
        this._mocks = [];
    }

    mockCreateConnection() {
        const mockConnection = new ConnectionMock();

        const mock = unit
            .stub(mongoose, 'createConnection')
            .returns(mockConnection);

        this._mocks = this._mocks.concat(mock);

        return mockConnection;
    }

    restore() {
        this._mocks.forEach(_mock => _mock.restore());
        this._mocks = [];
    }
}

export const MongooseMockInstance = new MongooseMock();
