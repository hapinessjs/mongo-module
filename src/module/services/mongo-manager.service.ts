import { Injectable, Inject, Optional } from '@hapiness/core';
import { AbstractHapinessMongoAdapter, IHapinessMongoAdapterConstructorArgs, MongooseAdapter } from '../adapters/index';
import { StringMap, MONGO_CONFIG } from '../utils/index';
import { Observable } from 'rxjs';

@Injectable()
export class MongoManagerService {

    private _config: IHapinessMongoAdapterConstructorArgs;
    private _adapters: StringMap<typeof AbstractHapinessMongoAdapter>;
    private _adaptersInstances: StringMap<AbstractHapinessMongoAdapter>;

    constructor(
        // @Optional()
        @Inject(MONGO_CONFIG) config: IHapinessMongoAdapterConstructorArgs
    ) {
        console.log('TOKEN => ', MONGO_CONFIG);
        console.log('OPTIONS #contruct before -- ', config);
        this._config = this._fixConfig(config);
        console.log('OPTIONS #contruct before -- ', this._config);
        this._adaptersInstances = {};
        this._adapters = {};

        this.registerAdapter(MongooseAdapter);
    }

    private _fixConfig(configValues?: IHapinessMongoAdapterConstructorArgs): IHapinessMongoAdapterConstructorArgs {
        return <IHapinessMongoAdapterConstructorArgs> (
            Object.assign(
                {},
                configValues
            )
        );
    }

    private _keyForAdapter(adapterName: string, options: IHapinessMongoAdapterConstructorArgs): string {
        return `${adapterName}_${options.db || options.database || 'default'}_${options.instance || 0}`;
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

    public getAdapter(adapterName: string, options?: any): AbstractHapinessMongoAdapter {
        if (!this._adapters[adapterName]) {
            throw new Error('Unknown adapter, please register it before using it.');
        }

        const _options: IHapinessMongoAdapterConstructorArgs =
            <IHapinessMongoAdapterConstructorArgs>Object.assign({}, this._config, options)
        console.log('OPTIONS #getAdapter -- ', _options);
        const key = this._keyForAdapter(adapterName, _options);
        if (!this._adaptersInstances[key]) {
            this._adaptersInstances[key] = new (this._adapters[adapterName])(_options);
        }

        return this._adaptersInstances[key];
    }
}
