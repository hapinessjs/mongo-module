import { HapinessModule, CoreModuleWithProviders, Inject, Optional } from '@hapiness/core';

import { MongoManagerService } from './services/index';
import { IHapinessMongoAdapterConstructorArgs } from './adapters/index';
import { MONGO_CONFIG } from './utils/index';

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
export class MongoModule  {
    static setConfig(config: IHapinessMongoAdapterConstructorArgs): CoreModuleWithProviders {
        return {
            module: MongoModule,
            providers: [
                {
                    provide: MONGO_CONFIG,
                    useValue: config
                }
            ]
        };
    }

    constructor(@Optional() @Inject(MONGO_CONFIG) config: IHapinessMongoAdapterConstructorArgs) {
        console.log('ploplop =>', config);
    }
}
