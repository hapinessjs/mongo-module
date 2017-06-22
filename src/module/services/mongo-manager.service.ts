import { Injectable, Inject, Optional } from '@hapiness/core';
import { AbstractHapinessMongoAdapter, IHapinessMongoAdapterConstructorArgs, MongooseAdapter } from '../adapters/index';
import { StringMap, defaultMongoConfig, Debugger, MONGO_CONFIG } from '../shared/index';
import { Observable } from 'rxjs';

const __debugger = new Debugger('MongooseAdapter');

@Injectable()
export class MongoManagerService {

    private _config: IHapinessMongoAdapterConstructorArgs;
    private _adapters: StringMap<typeof AbstractHapinessMongoAdapter>;
    private _adaptersInstances: StringMap<AbstractHapinessMongoAdapter>;

    constructor(
        @Optional() @Inject(MONGO_CONFIG) config: IHapinessMongoAdapterConstructorArgs
    ) {
        this._config = this._fixConfig(config);
        this._adaptersInstances = {};
        this._adapters = {};

        this.registerAdapter(MongooseAdapter);
    }

    private _fixConfig(configValues?: IHapinessMongoAdapterConstructorArgs): IHapinessMongoAdapterConstructorArgs {
        return <IHapinessMongoAdapterConstructorArgs> (
            Object.assign(
                {},
                defaultMongoConfig,
                configValues
            )
        );
    }

    private _keyForAdapter(adapterName: string, options: IHapinessMongoAdapterConstructorArgs): string {
        return `${adapterName}_${options.db || options.database}_${options.instance || 0}`;
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

    public getAdapter(adapterName: string, options?: any): Observable<AbstractHapinessMongoAdapter> {
        if (!this._adapters[adapterName]) {
            return Observable.throw(new Error(`Unknown adapter ${adapterName}, please register it before using it.`));
        }

        const _options: IHapinessMongoAdapterConstructorArgs =
            <IHapinessMongoAdapterConstructorArgs> Object.assign({}, this._config, options)

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
}
