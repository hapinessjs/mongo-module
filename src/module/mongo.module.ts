import { HapinessModule, CoreModuleWithProviders, Inject, Optional } from '@hapiness/core';

import { MongoClientExt } from './mongo.extension';
import { MongoManagerService } from './services/index';
import { IHapinessMongoAdapterConstructorArgs } from './adapters/index';

@HapinessModule({
    version: '1.0.0-beta.2',
    declarations: [ ],
    providers: [ ],
    exports: [ ]
})
export class MongoModule  {
}
