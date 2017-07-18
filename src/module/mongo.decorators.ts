import { Observable } from 'rxjs/Rx';
import { CoreDecorator, Type, createDecorator } from '@hapiness/core/core/decorators';
import { makeDecorator } from '@hapiness/core/externals/injection-js/util/decorators';

export interface MongoModel {
    adapter: string;
    collection: string;
}
export const MongoModel = createDecorator<MongoModel>('MongoModel', {
    adapter: undefined,
    collection: undefined
});

export interface Schema {
    readonly schema: any;
}
