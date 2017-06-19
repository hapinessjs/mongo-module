import { Injectable } from '@hapiness/core';
import { AbstractHapinessMongoAdapter, MongooseAdapter } from '../adapters/index';
import { StringMap } from '../utils/index';
import { Observable } from 'rxjs';

@Injectable()
export class MongoManagerService {

    private _adapters: StringMap<typeof AbstractHapinessMongoAdapter>;
    private _adaptersInstances: StringMap<AbstractHapinessMongoAdapter>;

    constructor() {
        this._adaptersInstances = {};

        this._adapters = {
            [MongooseAdapter.getInterfaceName()]: MongooseAdapter
        };
    }

    private _keyForAdapter(adapterName: string, options: any): string {
        return `${adapterName}_${options.dbname || 'default'}_${options.instance || 0}`;
    }

    public registerAdapter(adapterClass: typeof AbstractHapinessMongoAdapter): boolean {
        const adapterName: string = adapterClass.getInterfaceName();

        if (!this._adapters[adapterName]) {
            this._adapters[adapterName] = adapterClass;
        } else {
            throw new Error(`Provider ${adapterName} already exists.`);
        }

        return true;
    }

    public getAdapter(adapterName: string, options: any): AbstractHapinessMongoAdapter {
        if (!this._adapters[adapterName]) {
            throw new Error('Unknown adapter, please register it before using it.');
        }

        const key = this._keyForAdapter(adapterName, options);
        if (!this._adaptersInstances[key]) {
            this._adaptersInstances[key] = new (this._adapters[adapterName])({ dbname: options.dbname });
        }

        return this._adaptersInstances[key];
    }
}
