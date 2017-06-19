export interface IHapinessMongoAdapterConstructorArgs {
    dbname
}

/*
 * Not really abstract but we'll simulate it
 */
export class AbstractHapinessMongoAdapter {
    protected _dbname: string;

    public static getInterfaceName(): string {
        throw new Error('Your adapter should implements `getInterfaceName()`');
    }

    constructor(options: IHapinessMongoAdapterConstructorArgs) {
        this._dbname = options.dbname;
    }

    public getDbName() {
        return this._dbname;
    }

}
