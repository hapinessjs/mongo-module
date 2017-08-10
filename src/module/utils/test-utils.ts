import { Hapiness } from '@hapiness/core';
import { Model } from 'mongoose';
import { MongoClientService } from '../services';

export class MongoTestUtils {

    private static spawn;

    /**
     * Start the mongo deamon
     *
     * @param  {(err?)=>{}} done
     * @returns void
     */
    /* istanbul ignore next */
    public static startMongo(done: (err?) => {}): void {
        if (this.spawn) {
            this.spawn.kill();
        }
        this.spawn = require('child_process').spawn('mongod', ['--dbpath', '/tmp']);
        this.spawn.on('error', (err) => {
            done(err);
        });
        setTimeout(() => done(), 1500);
    }

    /**
     * Stop the mongo deamon
     *
     * @param  {(err?)=>{}} done
     * @returns void
     */
    /* istanbul ignore next */
    public static stopMongo(done: (err?) => {}): void {
        if (!this.spawn) {
            return;
        }
        this.spawn.kill();
        this.spawn = null;
        setTimeout(() => done(), 1500);
    }

    /**
     * Util to get the Mongoose Model
     * from the root module DI
     *
     * @param  {any} model
     * @returns Model
     */
    /* istanbul ignore next */
    public static getDefaultMongooseModel(model: any): Model<any> {
        return Hapiness['module']
            .di
            .get(MongoClientService)
            .getModel({ adapter: 'mongoose' }, model);
    }

}
