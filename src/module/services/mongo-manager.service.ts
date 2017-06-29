import { Injectable, Inject, Optional } from '@hapiness/core';

import {
    AbstractHapinessMongoAdapter,
    IHapinessMongoAdapterConstructorArgs,
    MongooseAdapter,
    MongooseGridFsAdapter
} from '../adapters/index';

import { StringMap, defaultMongoConfig, Debugger } from '../shared/index';
import { Observable } from 'rxjs';

const __debugger = new Debugger('MongoManagerService');

export class MongoManagerService {

    private _config: IHapinessMongoAdapterConstructorArgs;
    private _adapters: StringMap<typeof AbstractHapinessMongoAdapter>;
    private _adaptersInstances: StringMap<AbstractHapinessMongoAdapter>;

    constructor(config?: IHapinessMongoAdapterConstructorArgs) {
        this._config = this._fixConfig(config);
        this._adaptersInstances = {};
        this._adapters = {
            [MongooseAdapter.getInterfaceName()]: MongooseAdapter,
            [MongooseGridFsAdapter.getInterfaceName()]: MongooseGridFsAdapter
        };
    }

    private _fixConfig(configValues?: IHapinessMongoAdapterConstructorArgs): IHapinessMongoAdapterConstructorArgs {
        __debugger.debug('_fixConfig', '');
        return <IHapinessMongoAdapterConstructorArgs> (
            Object.assign(
                {},
                defaultMongoConfig,
                configValues
            )
        );
    }

    private _keyForAdapter(adapterName: string, options: IHapinessMongoAdapterConstructorArgs): string {
        __debugger.debug('_keyForAdapter', '');
        return `${adapterName}_${options.db || options.database}_${options.instance || 0}`;
    }

    public registerAdapter(adapterClass: typeof AbstractHapinessMongoAdapter): boolean {
        __debugger.debug('registerAdapter', '');
        const adapterName: string = adapterClass.getInterfaceName();
        __debugger.debug('registerAdapter', `---->  ${adapterName}`);
        if (!this._adapters[adapterName]) {
            this._adapters[adapterName] = adapterClass;
        } else {
            throw new Error(`Provider ${adapterName} already exists.`);
        }

        return true;
    }

    public loadAdapter(adapterName: string, options?: any): Observable<AbstractHapinessMongoAdapter> {
        __debugger.debug('loadAdapter', `Adapter name ---> ${adapterName}`);
        if (!this._adapters[adapterName]) {
            return Observable.throw(new Error(`Unknown adapter ${adapterName}, please register it before using it.`));
        }

        const _options: IHapinessMongoAdapterConstructorArgs = <IHapinessMongoAdapterConstructorArgs>
            Object.assign({}, this._config, options);

        const key = this._keyForAdapter(adapterName, _options);
        if (!this._adaptersInstances[key]) {
            this._adaptersInstances[key] = new (this._adapters[adapterName])(_options);
        }

        return this
            ._adaptersInstances[key]
            .whenReady()
            .switchMap(_ => Observable
                .create(observer => {
                    observer.next(this._adaptersInstances[key]);
                    observer.complete();
                })
            );
    }

    public getAdapter(adapterName: string, options?: any): AbstractHapinessMongoAdapter {
        __debugger.debug('getAdapter', `Adapter name ---> ${adapterName}`);

        const _options: IHapinessMongoAdapterConstructorArgs = <IHapinessMongoAdapterConstructorArgs>
            Object.assign({}, this._config, options);

        const key = this._keyForAdapter(adapterName, _options);

        return this._adaptersInstances[key];
    }
}
