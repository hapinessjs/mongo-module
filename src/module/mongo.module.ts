import { HapinessModule } from '@hapiness/core';
import { MongoClientService } from './services/index';

@HapinessModule({
    version: '1.0.0-rc.6.1',
    declarations: [ ],
    providers: [ ],
    exports: [ MongoClientService ]
})
export class MongoModule  {
}
