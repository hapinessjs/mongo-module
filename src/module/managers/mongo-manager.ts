import {
    HapinessMongoAdapter,
    HapinessMongoAdapterConstructorArgs,
    MongooseAdapter,
    MongooseGridFsAdapter
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
            [MongooseGridFsAdapter.getInterfaceName()]: MongooseGridFsAdapter
        };
    }

    private _fixConfig(configValues?: HapinessMongoAdapterConstructorArgs): HapinessMongoAdapterConstructorArgs {
        __debugger.debug('_fixConfig', '');
        return <HapinessMongoAdapterConstructorArgs> Object.assign({}, configValues);
    }

    private _keyForAdapter(adapterName: string, options: HapinessMongoAdapterConstructorArgs): string {
        __debugger.debug('_keyForAdapter', '');
        const key = `${adapterName}_${options.host }`
            .concat(
                !!options.db ?
                    `_${options.db}` :
                    !!options.database ?
                        `_${options.db}` : ''
            )
            .concat(`${options.instance || 0 }`);

        return key;
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

    public getAdapter(adapterName: string, options?: any): HapinessMongoAdapter {
        __debugger.debug('getAdapter', `Adapter name ---> ${adapterName}`);

        const _options: HapinessMongoAdapterConstructorArgs = <HapinessMongoAdapterConstructorArgs>
            Object.assign({}, this._config, options);

        const key = this._keyForAdapter(adapterName, _options);

        return this._adaptersInstances[key];
    }
}
