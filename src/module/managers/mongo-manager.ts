import {
    HapinessMongoAdapter,
    HapinessMongoAdapterConstructorArgs,
    MongooseAdapter,
    MongooseGridFsAdapter,
    MongooseGridFsBucketAdapter
} from '../adapters';

import { StringMap, Debugger } from '../shared';
import { Observable } from 'rxjs/Observable';

const __debugger = new Debugger('MongoManager');

export class MongoManager {

    private _config: HapinessMongoAdapterConstructorArgs;
    private _adapters: StringMap<typeof HapinessMongoAdapter>;
    private _adaptersInstances: StringMap<HapinessMongoAdapter>;

    constructor(config?: HapinessMongoAdapterConstructorArgs) {
        this._config = this._fixConfig(config);
        this._adaptersInstances = {};
        this._adapters = {
            [MongooseAdapter.getInterfaceName()]: MongooseAdapter,
            [MongooseGridFsAdapter.getInterfaceName()]: MongooseGridFsAdapter,
            [MongooseGridFsBucketAdapter.getInterfaceName()]: MongooseGridFsBucketAdapter
        };
    }

    protected _fixConfig(configValues?: HapinessMongoAdapterConstructorArgs): HapinessMongoAdapterConstructorArgs {
        __debugger.debug('_fixConfig', '');
        return <HapinessMongoAdapterConstructorArgs> Object.assign({}, configValues);
    }

    protected _keyForAdapter(adapterName: string, options: HapinessMongoAdapterConstructorArgs): string {
        __debugger.debug('_keyForAdapter', '');
        if (options.connectionName) {
            return options.connectionName;
        }

        const usedKeyForKeyComputation = ['db', 'database', 'url', 'instance'];
        const _keyElements = [adapterName].concat(
            Object.keys(options).reduce((acc, k) => {
                if (usedKeyForKeyComputation.indexOf(k) !== -1) {
                    return acc.concat(options[k]);
                }
                return acc;
            }, [])
        );

        return _keyElements.join('_');
    }

    public registerAdapter(adapterClass: typeof HapinessMongoAdapter): boolean {
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

    public loadAdapter(adapterName: string, options?: any): Observable<HapinessMongoAdapter> {
        __debugger.debug('loadAdapter', `Adapter name ---> ${adapterName}`);
        if (!this._adapters[adapterName]) {
            return Observable.throw(new Error(`Unknown adapter ${adapterName}, please register it before using it.`));
        }

        const _options: HapinessMongoAdapterConstructorArgs = <HapinessMongoAdapterConstructorArgs>
            Object.assign({}, this._config, options);

        const key = this._keyForAdapter(adapterName, _options);
        if (!this._adaptersInstances[key]) {
            this._adaptersInstances[key] = new (this._adapters[adapterName])(_options);
        }

        if (this._adaptersInstances[key].isConnected()) {
            return Observable.of(null)
                .map(() => this._adaptersInstances[key]);
        }

        return this
            ._adaptersInstances[key]
            .connect()
            .flatMap(() => this._adaptersInstances[key].whenReady())
            .map(_ => this._adaptersInstances[key]);
    }

    public getAdapter(adapterName: string, options?: any): HapinessMongoAdapter {
        __debugger.debug('getAdapter', `Adapter name ---> ${adapterName}`);

        const _options: HapinessMongoAdapterConstructorArgs = <HapinessMongoAdapterConstructorArgs>
            Object.assign({}, this._config, options);

        // If there is only one registered provider for the wanted adapter, dont compute the key but return it directly
        let key = '';
        const _keysForAdapterInstances = Object.entries(this._adaptersInstances)
            .filter(
                ([k, v]) =>
                    (<typeof HapinessMongoAdapter>v.constructor).getInterfaceName() === adapterName
            )
            .map(([k]) => k);

        if (_keysForAdapterInstances.length === 1) {
            key = _keysForAdapterInstances.shift();
        } else {
            key = this._keyForAdapter(adapterName, _options);
        }

        return this._adaptersInstances[key];
    }
}
