<img src="http://bit.ly/2mxmKKI" width="500" alt="Hapiness" />

<div style="margin-bottom:20px;">
<div style="line-height:60px">
    <a href="https://travis-ci.org/hapinessjs/mongo-module.svg?branch=master">
        <img src="https://travis-ci.org/hapinessjs/mongo-module.svg?branch=master" alt="build" />
    </a>
    <a href="https://coveralls.io/github/hapinessjs/mongo-module?branch=master">
        <img src="https://coveralls.io/repos/github/hapinessjs/mongo-module/badge.svg?branch=master" alt="coveralls" />
    </a>
    <a href="https://david-dm.org/hapinessjs/mongo-module">
        <img src="https://david-dm.org/hapinessjs/mongo-module.svg" alt="dependencies" />
    </a>
    <a href="https://david-dm.org/hapinessjs/mongo-module?type=dev">
        <img src="https://david-dm.org/hapinessjs/mongo-module/dev-status.svg" alt="devDependencies" />
    </a>
</div>
<div>
    <a href="https://www.typescriptlang.org/docs/tutorial.html">
        <img src="https://cdn-images-1.medium.com/max/800/1*8lKzkDJVWuVbqumysxMRYw.png"
             align="right" alt="Typescript logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://reactivex.io/rxjs">
        <img src="http://reactivex.io/assets/Rx_Logo_S.png"
             align="right" alt="ReactiveX logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://hapijs.com">
        <img src="http://bit.ly/2lYPYPw"
             align="right" alt="Hapijs logo" width="75" style="border:none;" />
    </a>
</div>
</div>

# Mongo Module

`Mongo` module for the Hapiness framework including `mongoose`, `mongoose-gridfs` (deprecated) and `mongoose-gridfs-bucket` adapter one.

## Table of contents

* [Using your module inside Hapiness application](#using-your-module-inside-hapiness-application)
    * [`yarn` or `npm` it in your `package.json`](#yarn-or-npm-it-in-your-package)
    * [Importing `MongoModule` from the library](#importing-mongomodule-from-the-library)
* [Creating `Adapters`](#creating-adapters)
    * [Step 1](step-1)
    * [Step 2](step-2)
    * [Step 3](step-3)
* [Registering adapters](registering-adapters)
* [Using a registered adapter](#using-a-registered-adapter)
* [Configuration](#configuration)
* [Get your adapter anywhere](#get-your-adapter-anywhere)
* [Model management](#model-management)
* [Helpers functions](#helpers-functions)
* [Contributing](#contributing)
* [Change History](#change-history)
* [Maintainers](#maintainers)
* [License](#license)

## Using your module inside Hapiness application

### `yarn` or `npm` it in your `package.json`

```bash
$ npm install --save @hapiness/core @hapiness/mongo rxjs

or

$ yarn add @hapiness/core @hapiness/mongo rxjs
```

```json5
"dependencies": {
    "@hapiness/core": "^1.3.0",
    "@hapiness/mongo": "^1.1.3",
    "rxjs": "^5.5.6",
    //...
}
//...
```

### Importing `MongoModule` from the library

This module provide an Hapiness extension for Mongo. To use it, simply register it during the `bootstrap` step of your project like that:

```typescript
import { MongoModule, MongoClientExt } from '@hapiness/mongo';

@HapinessModule({
    version: '1.0.0',
    providers: [ ],
    declarations: [ ],
    imports: [ MongoModule ]
})
class MyModule implements OnStart {

    constructor() { /* ... */ }
}

Hapiness.bootstrap(MyModule, [ MongoClientExt.setConfig(/* ... */) ]);
```

[Back to top](#table-of-contents)

## Creating `Adapters`

The `Mongo` module is based on adapters. Included to the module, there is an adapter using mongoose and one using mongoose to manage gridfs.

But you can create your own adapters if you want by following some required steps described belows.

### Step 1

Your adapter should be a class which inherits from `AbstractHapinessMongoAdapter`.

### Step 2

You absolutely need to implement a static function `getInterfaceName`, which will return a uniq string identifier for your adapter (**NOTE** `mongoose`, `mongoose-gridfs` and `mongoose-gridfs-bucket` are already used by adapters provided by this module).

### Step 3

You need to override 4 functions

```typescript
    _tryConnect(): Observable<void> { /* ... */ }

    _afterConnect(): Observable<void> { /* ... */ }

    getLibrary(): any { /* ... */ }

    registerValue(): any { /* ... */ }
```

*_tryConnect:* you will create your database connection inside

Example for mongoose

```typescript
protected _tryConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._isReady = false;

                if (this._db) {
                    this._db.close();
                }

                const connectOptions = {
                    server: {
                        reconnectTries: Number.MAX_VALUE,
                        reconnectInterval: 5000,
                    },
                };

                this._connection = mongoose.createConnection(this._uri, connectOptions);

                this._connection.once('connected', () => {
                    observer.next();
                    observer.complete();
                });

                this._connection.once('error', err => {
                    observer.error(err);
                });
            });
    }
```

*_afterConnect:* this function will be called just after `_tryConnect` if you want to manage some stuff once your connection is fine.

Example for mongoose:

```typescript
protected _afterConnect(): Observable<void> {
        return Observable
            .create(observer => {
                this._db = this._connection.db;

                this.onConnected().subscribe(_ => {
                    /* ... */
                }, (e) => {
                    /* ... */
                });

                this._connection.once('error', err =>
                    this.onError(err).subscribe(_ => {
                        /* ... */
                    }, (e) => {
                        /* ... */
                    })
                );

                this._connection.once('disconnected', () =>
                    this.onDisconnected().subscribe(_ => {
                        /* ... */
                    }, (e) => {
                        /* ... */
                    })
                );

                observer.next();
                observer.complete();
            });
    }
```

*getLibrary:* this will just return the library your adapter use to use it as you want.

Example for mongoose:

```typescript
public getLibrary(): any {
    return mongoose;
}
```

*registerValue:* this will register your document and return a model value to get through the DI.

Example for mongoose:

```typescript
public registerValue(document, collection): any {
    return this._connection.model(collection, document);
}
```

**NOTE** DONT FORGET TO SET `_isReady = true` once you are done, else your adapter will never be ready.

You should also override:

```typescript
    close(): Observalbe<void> { /*  */ }
```

[Back to top](#table-of-contents)

## Registering adapters

When you want to create your own adapters, first you need to tell the Mongo extension to register it. The Mongo extension will add your classes and map it with the uniq identifier you put inside the static `ddd`.

```typescript
class MyCustomAdapter extends AbstractHapinessMongoAdapter {
    public static getInterfaceName(): string {
        return 'custom-identifier-for-my-adapter';
    }

    constructor(options) { super(options); }

    /* ... */
}

Hapiness.bootstrap(
    MyModule,
    [
        MongoClientExt
            .setConfig(
                {
                    register: [ MyCustomAdapter ]
                }
            )
    ]
);
```

Now, the mongo extension knows that an Adapter with the identifier `custom-identifier-for-my-adapter` exists.

The two provided adapters don't need to be registered as it is already done.

## Using a registered adapter

It will work the same for both custom adapters you made and provided adapters.

Just load them with the config you want to use:

```typescript
class MyCustomAdapter extends AbstractHapinessMongoAdapter {
    public static getInterfaceName(): string {
        return 'custom-identifier-for-my-adapter';
    }

    constructor(options) { super(options); }
}

Hapiness.bootstrap(
    MyModule,
    [
        MongoClientExt
            .setConfig(
                {
                    register: [ MyCustomAdapter ]
                    load: [
                        {
                            name: 'custom-identifier-for-my-adapter',
                            config: {
                                host: 'my.hostname1.com',
                                port: 27017,
                                db: 'db_1'
                            }
                        },
                        {
                            name: 'mongoose',
                            config: {
                                host: 'my.hostname2.com',
                                port: 27017,
                                db: 'db_1'
                            }
                        }
                    ]
                }
            )
    ]
);
```

So you can load as many connections as you want and provide custom configs for each adapter you load.

[Back to top](#table-of-contents)

## Configuration

When you load adapters (see previous section), you can provide a config, but you have the possibility to not provide one every time.

Lets say you want two adapters pointing to the same database, you can for that use the `common` option.

```typescript
class MyCustomAdapter extends AbstractHapinessMongoAdapter {
    public static getInterfaceName(): string {
        return 'custom-identifier-for-my-adapter';
    }

    constructor(options) { super(options); }
}

Hapiness.bootstrap(
    MyModule,
    [
        MongoClientExt
            .setConfig(
                {
                    register: [ MyCustomAdapter ]
                    common: {
                        host: 'my.hostname.com',
                        port: 27017,
                        db: 'my_db'
                    }
                    load: [
                        {
                            name: 'custom-identifier-for-my-adapter'
                        },
                        {
                            name: 'mongoose'
                        }
                    ]
                }
            )
    ]
);
```

[Back to top](#table-of-contents)

## Get your adapter anywhere

To get your adapter and play with it, you need to inject the MongoClientService in your class and call the `get()` function to get an instance of the adapter manager.

Once you did it, you'll be able to get your adapter with its name only or with its name and options (if you have the same adapter in different DBs or host ...) calling the function `getAdapter(...)`.

Example showing how to get mongoose adapter for `my_database`:

```typescript
@Injectable()
class MyModelDocument {
    private _myModelConnection: any;

    constructor(
        private _mongoClient: MongoClientService
    ) {
        this._myModelConnection = null;
    }

    init() {
        // You can do that...
        const dao = this._mongoClient.get().getAdapter('mongoose').getLibrary();

        // ... or that
        const connection = this._mongoClient.get().getAdapter('mongoose', { db: 'my_database' }).getConnection();

        const MyModel = dao.Schema({
            username: String,
        });

        this._myModelConnection = connection.model('MyModel', MyModel);
    }

    get() {
        return this._myModelConnection;
    }
}
```

[Back to top](#table-of-contents)

## Model Management

You can implement and register models in the adapter

Example:

```typescript
@MongoModel({
    adapter: 'mongoose',
    collection: 'collection', // The name of the collection, will be pluralize using mongoose if no collectionName is explicitly given
    collectionName: 'collectionName', // Optional, will force this name as the collection name
    options: { ... } // @see HapinessMongoAdapterConstructorArgs type
})
class MyModel extends Model {

    readonly schema;

    constructor(private mongoClientService: MongoClientService) {
        super(MyModel) // /!\ Important to get connection options
        const DAO = mongoClientService.getDao(this.connectionOptions);
        this.schema = new DAO.Schema({
            id: String
        });

        ...
    }
}

@Route({
    path: '/my-route',
    method: 'get'
})
class MyRoute implements OnGet {
    constructor(private mongoClientService: MongoClientService) {}

    onGet(request, reply) {
        const model = this.mongoClientService.getModel({ adapter: 'mongoose', options: {} }, MyModel);

        ...
    }
}

@HapinessModule({
    version: '1.0.0',
    declarations: [ MyModel, MyRoute ]
})
class MyModule {}

```

[Back to top](#table-of-contents)

## Helpers functions

The module gives you an helpers to perform some basic mongo-related operations.

Just import the class from the module

```typescript
import { MongoUtils } from '@hapiness/mongo'
```

There is 4 static functions (for now)

`public static prepareUpdateObject(dto: any): any`: Give to this function an object like `{ "meta": { "key": "value" } }` and it returns you the object `{ "meta.key": "value" }`. Very usefull to perform update operations!

`public static toObjectId(id: string)`: Returns an ObjectID type from the given string (`null` if the string is not a valid ObjectID)

`public static fieldsStringFromArray(fields: string[]): string`: If you want to select only some fields and you need for that to compute a string from an array of string, use this function

`public static filterFindCondition(condition: any): any`: If you have a query object for mongo, this function will parse your condition, convert the field `id` into `_id` and then convert `_id` to an `ObjectID` before giving back the query object

[Back to top](#table-of-contents)

## Contributing

To set up your development environment:

1. clone the repo to your workspace,
2. in the shell `cd` to the main folder,
3. hit `npm or yarn install`,
4. run `npm or yarn run test`.
    * It will lint the code and execute all tests.
    * The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

[Back to top](#table-of-contents)

## Change History

* v2.1.0
    * Now set by default `useNewUrlParser: true`, `useCreateIndex: true` and `useFindAndModify: false` on the connectionOptions of mongoose.
* v2.0.2
    * More debug and events for mongoose adapter
* v2.0.1
    * Fix Mongo Utils - prepareUpdateObject
* v2.0.0
    * Updated mongoose to latest version
    * Removed the call to createConnection from the constructor of mongo adapter.
    * Now catch connection errors and pipe them out to be catch by user later on. No more waiting for timeout to realize there is a connection error.
    * MongooseGridfsAdapter is now deprecated. Use MongooseGridfsBucketAdapter
* v1.2.0 (2018-04-05)
    * Updated packages' versions.
    * added support of `OnShutdown` of `hapiness Core`
    * added `close` functions to adapters.
    * Fix typos in documentation.
* v1.1.3 (2018-01-16)
    * Fix get adapter using adapter name
* v1.1.2 (2018-01-09)
    * Latest packages' versions.
    * Added connectionName options to identify an adapter by an alias
    * Bug fix on an `indexOf !== 1` instead of `indexOf !== -1`
    * Documentation.
* v1.1.1 (2017-12-12)
    * Latest packages' versions.
    * Add field `collectionName` to force using a specific name for a collection.
    * Fix key computation when retrieving an adapter.
    * Allow developers to not give all options for the adapter when getting a document.
    * Documentation.
* v1.1.0 (2017-11-20)
    * Latest packages' versions.
    * Update Module + Tests related to latest `core` version.
    * Documentation.
    * Change packaging process.
* v1.0.0 (2017-11-14)
    * `MongoDB` module implementation.
    * Tests module API.
    * Documentation.

[Back to top](#table-of-contents)

## Maintainers

<table>
    <tr>
        <td colspan="5" align="center"><a href="https://www.tadaweb.com"><img src="http://bit.ly/2xHQkTi" width="117" alt="tadaweb" /></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil"><img src="https://avatars3.githubusercontent.com/u/6546204?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/antoinegomez"><img src="https://avatars3.githubusercontent.com/u/997028?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/reptilbud"><img src="https://avatars3.githubusercontent.com/u/6841511?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/njl07"><img src="https://avatars3.githubusercontent.com/u/1673977?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/xmaIIoc"><img src="https://avatars2.githubusercontent.com/u/1898461?s=117&v=4" width="117"/></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil">Julien Fauville</a></td>
        <td align="center"><a href="https://github.com/antoinegomez">Antoine Gomez</a></td>
        <td align="center"><a href="https://github.com/reptilbud">Sébastien Ritz</a></td>
        <td align="center"><a href="https://github.com/njl07">Nicolas Jessel</a></td>
        <td align="center"><a href="https://github.com/xmaIIoc">Florent Bennani</a></td>
    </tr>
</table>

[Back to top](#table-of-contents)

## License

Copyright (c) 2017 **Hapiness** Licensed under the [MIT license](https://github.com/hapinessjs/mongo-module/blob/master/LICENSE.md).

[Back to top](#table-of-contents)
