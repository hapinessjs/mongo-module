
# Mongo Module

```Mongo``` module for the Hapiness framework including a ```mongoose``` adapter and a ```mongoose-gridfs``` one.

## Table of contents

* [Using your module inside Hapiness application](#using-your-module-inside-hapiness-application)
    * [`yarn` or `npm` it in your `package.json`](#yarn-or-npm-it-in-your-package)
    * [Importing `MongoModule` from the library](#importing-mongomodule-from-the-library)
* [Creating ```Adapters```](#creating-adapters)
    * [Step 1](step-1)
    * [Step 2](step-2)
    * [Step 3](step-3)
* [Registering adapters](registering-adapters)
* [Using a registered adapter](#using-a-registered-adapter)
* [Configuration](#configuration)
* [Get your adapter anywhere](#get-your-adapter-anywhere)
* [Maintainers](#maintainers)
* [License](#license)

## Using your module inside Hapiness application

### `yarn` or `npm` it in your `package.json`

```bash
$ npm install --save @hapiness/mongo

or

$ yarn add @hapiness/mongo
```
    
```javascript
"dependencies": {
    "@hapiness/core": "^1.0.0-beta.6",
    "@hapiness/mongo": "^1.0.0-beta.6",
    //...
}
//...
```
 
### Importing `MongoModule` from the library

This module provide an Hapiness extension for Mongo. To use it, simply register it during the ```bootstrap``` step of your project like that:
```javascript

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

## Creating ```Adapters```

The ```Mongo``` module is based on adapters. Included to the module, there is an adapter using mongoose and one using mongoose to manage gridfs.

But you can create your own adapters if you want by following some required steps describe belows.

### Step 1

Your adapter should be a class which inherits from ```AbstractHapinessMongoAdapter```.

### Step 2

You absolutely needs to implement a static function ```getInterfaceName```, which will return a uniq string identifier for your adapter (**NOTE** ```mongoose``` and ```mongoose-gridfs``` are already use for included adapters of this module).

### Step 3

You need to override 3 functions

```javascript
    _tryConnect(): Observable<void> { /* ... */ }
    
    _afterConnect(): Observable<void> { /* ... */ }
    
    getLibrary(): any { /* ... */ }
```

*_tryConnect:* you will create your database connection inside

Example for mongoose

```javascript
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
                    observer.complete();
                });
            });
    }
```

*_afterConnect:* this function will be called just after ```_tryConnect``` if you want to manage some stuff once your connection is fine.

Example for mongoose:

```javascript
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

```javascript
public getLibrary(): any {
    return mongoose;
}
````


**NOTE**  DONT FORGET TO SET ```_isReady = true``` once you are done, else your adapter will never be ready.

[Back to top](#table-of-contents)

## Registering adapters

When you want created your own adapters, you first need to tell the Mongo extension to register it. The Mongo extension will add your class and map it with the uniq identifier you put inside the static ```ddd```.

```javascript

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

Now, the mongo extension know that an Adapter with identifier ```custom-identifier-for-my-adapte``` exists.

The two provided adapters dont needs to be registered as it is already done.

## Using a registered adapter

It will work the same for both custom adapters you made and provided adapters.

Just load them with the config you want to use:

```javascript

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

So you can load as much connection as you want and provide custom config for each adapter you load.

[Back to top](#table-of-contents)

## Configuration

When you load adapter (see previous section), you can provide config, but you have the possibility to not provide one every time.

Lets say you want two adapters pointing to the same database, you can for that use the ```common``` option.

```javascript

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

To get your adapter and play with it, you need to inject the MongoClientService in your class and call the ```get()`` function to get an instance of the adapter manager.

Once you did it, you'll able to get your adapter with it's name only or with its name and options (if you have the same adapter in different db or host ...) calling the function ```getAdapter(...)```.

Example showing how to get mongoose adapter for ```my_database```:

```javascript

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

## Maintainers

<table>
    <tr>
        <td colspan="4" align="center"><a href="https://www.tadaweb.com"><img src="https://tadaweb.com/images/tadaweb/logo.png" width="117" alt="tadaweb" /></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil"><img src="https://avatars3.githubusercontent.com/u/6546204?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/antoinegomez"><img src="https://avatars3.githubusercontent.com/u/997028?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/reptilbud"><img src="https://avatars3.githubusercontent.com/u/6841511?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/njl07"><img src="https://avatars3.githubusercontent.com/u/1673977?v=3&s=117" width="117"/></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil">Julien Fauville</a></td>
        <td align="center"><a href="https://github.com/antoinegomez">Antoine Gomez</a></td>
        <td align="center"><a href="https://github.com/reptilbud">Sébastien Ritz</a></td>
        <td align="center"><a href="https://github.com/njl07">Nicolas Jessel</a></td>
    </tr>
</table>

[Back to top](#table-of-contents)

## License

Copyright (c) 2017 **Hapiness** Licensed under the [MIT license](https://github.com/hapinessjs/mongo-module/blob/master/LICENSE.md).

[Back to top](#table-of-contents)
