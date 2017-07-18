import { MongoModel, Model } from './mongo.decorators';
import {
    CoreModule,
    DependencyInjection,
    Extension,
    ExtensionWithConfig,
    extractMetadataByDecorator,
    OnExtensionLoad,
    OnModuleInstantiated,
} from '@hapiness/core/core';

import { Observable } from 'rxjs';
import { MongoManager } from './managers/index';
import { HapinessMongoAdapter, HapinessMongoConfig, HapinessLoadAdapterConfig } from './adapters/index';

import { Debugger } from './shared/index';

const __debugger = new Debugger('MongoClientExtension');

export class MongoClientExt implements OnExtensionLoad, OnModuleInstantiated {

    private _mongoManager: MongoManager;

    static setConfig(config: HapinessMongoConfig): ExtensionWithConfig {
        return {
            token: MongoClientExt,
            config,
        };
    }

    registerAdapters(mongoManager: MongoManager, adaptersToRegister: Array<typeof HapinessMongoAdapter>): Observable<void> {
        __debugger.debug('registerAdapters', '');
        return Observable
            .create(
                observer => {
                    if (!adaptersToRegister || !adaptersToRegister.length) {
                        observer.next();
                        observer.complete();
                    } else {
                        const errors = adaptersToRegister
                            .map((_adapter: typeof HapinessMongoAdapter) => {
                                try {
                                    const res = mongoManager.registerAdapter(_adapter);
                                    __debugger.debug('registerAdapters', `Correctly register ${JSON.stringify(res, null, 2)}`);
                                    return null;
                                } catch (err) {
                                    return err;
                                }
                            })
                            .filter(item => !!item);

                        __debugger.debug('registerAdapters', `Correctly register ${JSON.stringify(errors.map(e => e.message), null, 2)}`);
                        if (!errors.length) {
                            observer.next();
                            observer.complete();
                        } else {
                            observer.error(errors.shift());
                        }
                    }
                }
            );
    }

    loadAdapters(mongoManager: MongoManager, adaptersToLoad: HapinessLoadAdapterConfig[]): Observable<void> {
        __debugger.debug('loadAdapters', `Params => ${JSON.stringify(adaptersToLoad, null, 2)}`);
        return Observable
            .create(
                observer => {
                    if (!adaptersToLoad || !adaptersToLoad.length) {
                        observer.next();
                        observer.complete();
                    } else {
                        Observable
                            .forkJoin(
                                adaptersToLoad
                                    .map(
                                        (adapterConfig: HapinessLoadAdapterConfig) =>
                                            mongoManager.loadAdapter(
                                                adapterConfig.name,
                                                adapterConfig.config
                                            )
                                    )
                            )
                            .subscribe(_ => {
                                __debugger.debug('loadAdapters', 'END of loading');
                                observer.next();
                                observer.complete();
                            }, (err) => {
                                __debugger.debug('loadAdapters', `GOT ERROR => ${err.message}`);
                                observer.error(err);
                            });
                    }
                }
            );
    }


    private storeDocuments(module: CoreModule) {
        [].concat(module.declarations)
            .filter(_ => !!extractMetadataByDecorator(_, 'MongoModel'))
            .forEach(_ => {
                const instance = DependencyInjection.instantiateComponent<Model>(_, module.di);
                const metadata = extractMetadataByDecorator<MongoModel>(_, 'MongoModel');
                const adapter = this._mongoManager.getAdapter(metadata.adapter, metadata.options);
                adapter.getModelManager().add({
                    token: _,
                    value: adapter.registerValue(instance.schema, metadata.collection)
                });
            });
        module.modules.forEach(_ => this.storeDocuments(_));
    }

    /**
     * Initilization of the extension
     * Create the socket server
     *
     * @param  {CoreModule} module
     * @param  {SocketConfig} config
     * @returns Observable
     */
    onExtensionLoad(module: CoreModule, config: HapinessMongoConfig): Observable<Extension> {
        return Observable
            .create(observer => {
                this._mongoManager = new MongoManager(config.common);
                this
                    .registerAdapters(this._mongoManager, config.register)
                    .switchMap(_ => this.loadAdapters(this._mongoManager, config.load))
                    .subscribe(_ => {
                        observer.next({
                            instance: this,
                            token: MongoClientExt,
                            value: this._mongoManager
                        });
                        observer.complete();
                    }, (err) => {
                        observer.error(err);
                    });
            });
    }

    onModuleInstantiated(module: CoreModule): Observable<any> {
        return Observable.create(observer => {
            this.storeDocuments(module);
            observer.next();
            observer.complete();
        });
    }
}
