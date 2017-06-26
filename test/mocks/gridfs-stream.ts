import * as unit from 'unit.js';
import * as gfs from '../../src/module/shared/gridfs-stream';

import { EventEmitter } from 'events';

export class GridFsMock {
    private _mocks;

    constructor() {
        this._mocks = [];
    }

    mockGridFsStream() {
        const mock = unit
            .stub(gfs, 'CreateGridFsStream')
            .returns(42);

        this._mocks = this._mocks.concat(mock);

        return mock;
    }

    restore() {
        this._mocks.forEach(_mock => _mock.restore());
        this._mocks = [];
    }
}

export const GridFsMockInstance = new GridFsMock();
