import { AbstractHapinessMongoAdapter } from './mongo-adapter.abstract';

export class MongooseAdapter extends AbstractHapinessMongoAdapter {

    public static getInterfaceName(): string {
        return 'mongoose';
    }

    constructor(options) {
        super(options);
    }

}
