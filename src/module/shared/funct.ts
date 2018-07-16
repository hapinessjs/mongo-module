import * as Url from 'url';

export class UtilFunctions {

    public static hideCredentials(uri: string): string {
        return uri.replace(/\/\/.*@/, '//***:***@');
    }

    public static getMongoUri(dbUrl: string, db?: string) {
        // If no db is provided we wannot append the db in the url
        if (!db) {
            return dbUrl;
        }

        const splitUri = dbUrl.split('://');
        const splitUri2 = splitUri[1].split('/');
        if (splitUri2.length === 2) {
            const parsedDb = Url.parse(splitUri2[1]);
            parsedDb.pathname = db;
            splitUri2[1] = Url.format(parsedDb);
            splitUri[1] = splitUri2.join('/');
            return splitUri.join('://');
        }

        return [dbUrl, db].join('/');
    }

}
