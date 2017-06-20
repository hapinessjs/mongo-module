import { HapinessModule,  InjectionToken, CoreModuleWithProviders, OnRegister, Inject, Optional } from '@hapiness/core';

import { IHapinessMongoAdapterConstructorArgs } from './adapters';

import { MongoManagerService } from './services/index';

export const MONGO_MODULE_CONFIG = new InjectionToken('mongo_module_config');

@HapinessModule({
    version: '1.0.0-beta.2',
    declarations: [

    ],
    providers: [
        MongoManagerService
    ],
    exports: [
        MongoManagerService
    ]
})
export class MongoModule implements OnRegister {
    static setConfig(config: IHapinessMongoAdapterConstructorArgs): CoreModuleWithProviders {
        return {
            module: MongoModule,
            providers: [
                {
                    provide: MONGO_MODULE_CONFIG,
                    useValue: config
                }
            ]
        };
    }

    constructor(
        @Optional() @Inject(MONGO_MODULE_CONFIG) private config?: IHapinessMongoAdapterConstructorArgs
    ) {
        console.log('---- module#constructor => ', this.config);
    }

    onRegister() {
        console.log('---- onRegister => ');
    }
}
