import { HapinessModule } from '@hapiness/core';
import { MongoManagerService } from './services';

@HapinessModule({
    version: '1.0.0-beta.2',
    declarations: [

    ],
    providers: [
        MongoManagerService
    ],
    exports: [

    ]
})
export class HelloWorldModule {}
