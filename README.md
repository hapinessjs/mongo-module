<img src="http://bit.ly/2mxmKKI" width="500" alt="Hapiness" />

<div style="margin-bottom:20px;">
<div style="line-height:60px">
    <a href="https://travis-ci.org/hapinessjs/empty-module.svg?branch=master">
        <img src="https://travis-ci.org/hapinessjs/empty-module.svg?branch=master" alt="build" />
    </a>
    <a href="https://coveralls.io/github/hapinessjs/empty-module?branch=master">
        <img src="https://coveralls.io/repos/github/hapinessjs/empty-module/badge.svg?branch=master" alt="coveralls" />
    </a>
    <a href="https://david-dm.org/hapinessjs/empty-module">
        <img src="https://david-dm.org/hapinessjs/empty-module.svg" alt="dependencies" />
    </a>
    <a href="https://david-dm.org/hapinessjs/empty-module?type=dev">
        <img src="https://david-dm.org/hapinessjs/empty-module/dev-status.svg" alt="devDependencies" />
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

This package provides basics to create a new [Hapiness](https://github.com/hapinessjs/hapiness) module.

Implementations of [Hapiness' route and service](https://github.com/hapinessjs/hapiness/blob/master/API.md) are done and related tests too.

## Table of contents

* [Starter](#starter)
* [Folders](#folders)
* [Files](#files)
    * [Typescript configuration files](#typescript-configuration-files)
    * [Typescript validation](#typescript-validation)
    * [Yarn](#yarn)
    * [Package definition](#package-definition)
    * [NVM](#nvm)
* [Development](#development)
    * [Module](#module)
    * [Services](#services)
    * [Routes](#routes)
    * [Libraries](#libraries)
    * [Tests](#tests)
* [Deployment](#deployment)
* [Using your module inside Hapiness application](#using-your-module-inside-hapiness-application)
    * [Yarn or NPM it in your package.json](#yarn-or-npm-it-in-your-packagejson)
    * [Import {MyModule}Module from the library](#import-mymodulemodule-from-the-library)
    * [Use it anywhere](#use-it-anywhere)
* [Change History](#change-history)
* [Maintainers](#maintainers)
* [License](#license)

## Starter

Download this [starter](https://github.com/hapinessjs/empty-module/releases/tag/v1.0.0-beta.6) and change `hapinessjs/empty-module` and `@hapiness/empty-module`, according **your module name and repository**, in these files:
* `package.json`
* `README.md`

In `README.md`, you need to update the documentation to explain what's your module and what it does.

Delete `.travis.yml` if you don't want to have [travis-ci](https://travis-ci.org) integration. 

[Back to top](#table-of-contents)
 
## Folders

All **files** for your module will be in **`src`** folder and wrote in `Typescript`. 

All **tests files** for your module will be in **`test`** folder and wrote in `Typescript` too.
* **Unit** tests will be in `test/unit` folder 
* **Integration** tests will be in `test/integration` folder

All **packaging files** for your module will be in **`tools`** folder and wrote in `Typescript` too.

[Back to top](#table-of-contents)

## Files

### Typescript configuration files

`tsconfig.json` is used for **development** process and  `tsconfig.build.json` is used for **build** process.

In both case, add externals types from `@types/{...}` inside `compilerOptions.types` array.
 
### Typescript validation

`tslint.json` contains all rules for `Typescript` validation during `pretest` process.

### Yarn

`yarn.lock` contains fixed packages' versions for all `node_modules` used in your module.
 
 See [yarn cli documentation](https://yarnpkg.com/en/docs/cli/) to know how to use it.
 
### Package definition

`package.json` contains your module definition with **name**, **description**, **scripts**, **dependencies**, etc.

To install existing or new dependencies use `npm` or `yarn`. We advice to use `yarn` to have the same version that us.

In `scripts` part, you have all needed scripts to work. All scripts reference elements in `Makefile`.

[Back to top](#table-of-contents)

### NVM

If you want to use `nvm`, install `node` version according `.nvmrc` file and type:

```bash
$ cd path/to/hapiness/module
$ nvm use
```

[Back to top](#table-of-contents)

## Development

All your module's contents must be inside `src/module` folder.

Each folder must have a `barrels` index file.

We have a convention name for each files so follow this guideline to be ok with the next `hapiness-cli`

### Module

Your **main module** file must be at the root of `src/module` folder and named `{my-module}.module.ts`. Class will be `{MyModule}Module`.

**Module** needs to have `@HapinessModule({...})` **decorator**.

Export it with `barrels` index at the root of `src/module`.

### Services

All **services** files must be inside `src/module/services` folder and named `{my-service}.service.ts`. Class will be `{MyService}Service`.

**Service** needs to have `@Inject()` **decorator** and be added inside **module** `metadata`'s **providers** array.

Export it with `barrels` index at the root of `src/module/services`.

You can organize **services** by **features** and create folders for that. Don't forget to create `barrels` index for each folder.

If your **service** needs to be **exported** by your module to be **accessible in the DI** of other module, you need to **export it** with `barrels` index at the root of `src/module` and add it inside **module** `metadata`'s **exports** array.

### Routes

All **routes** files must be inside `src/module/routes` folder and organize by **resources**. In each resource folder, you need to create `barrels` index and  **method** file named `{method}.route.ts`. Class will be `{MethodResource}Route`.

**Route** needs to have `@Route({...})` **decorator** and be added inside **module** `metadata`'s **declarations** array.

Export it with `barrels` index at the root of `src/module/routes`.

### Libraries

All **libraries** files must be inside `src/module/libraries` folder and named `{my-library}.library.ts`. Class will be `{MyLibrary}Library`.

**Library** needs to have `@Lib()` **decorator** and be added inside **module** `metadata`'s **declarations** array.

Export it with `barrels` index at the root of `src/module/libraries`.

You can organize **libraries** by **features** and create folders for that. Don't forget to create `barrels` index for each folder.

### Tests

You must **unit** test each **service**, **route** and **library**.

Your **module** must be tested with an **integration** in `Hapiness` server application.

Each file name will be suffixed by `test`: `{my-module}.module.test.ts`, `{my-service}.service.test.ts`, `{resource}.{method}.route.test.ts` or `{my-library}.library.test.ts`.

Classes will be suffixed by `Test`: `{MyModule}ModuleTest`, `{MyService}ServiceTest`, `{MethodResource}RouteTest` or `{MyLibrary}LibraryTest`.

To **run** your tests, just execute:

```bash
$ cd path/to/hapiness/module

$ yarn run test

or

$ npm run test
```

**Coverage** result will be inside `./coverage/lcov-report` folder. Just open the folder in your browser to see the result.

[Back to top](#table-of-contents)

## Deployment

Build your project:

```bash
$ cd path/to/hapiness/module

$ yarn run build

or

$ npm run build
```

Packaging will be created inside `dist` folder. You need to publish only the content of this folder:

```bash
$ cd path/to/hapiness/module/dist
$ npm publish (--access public => if scoped package)
```

[Back to top](#table-of-contents)

## Using your module inside Hapiness application

### `yarn` or `npm` it in your `package.json`

```bash
$ npm install --save @{your_scope}/{your_module}

or

$ yarn add @{your_scope}/{your_module}
```
    
```javascript
"dependencies": {
    "@hapiness/core": "^1.0.0-beta.6",
    "@{your_scope}/{your_module}": "^1.0.0-beta.6",
    //...
}
//...
```

### import `<MyModule>Module` from the library

```javascript
import { Hapiness, HapinessModule } from '@hapiness/core';
import { <MyModule>Module } from '@{your_scope}/{your_module}';

@HapinessModule({
    version: '1.0.0',
    options: {
        host: '0.0.0.0',
        port: 4443
    },
    imports: [
        <MyModule>Module
    ]
})
class HapinessModuleApp {}

Hapiness.bootstrap(HapinessModuleApp);
```

### use it anywhere

If your **module** contains **route** just call specific `endpoint` to see the result and use **service** anywhere with **dependency injection**.

[Back to top](#table-of-contents)

## Change History

* v1.0.0-beta.6 (2017-05-26)
    * Latest packages' versions.
    * Fix new typings for HapiJS.
    * New packaging script.
    * Module version related to core version.
* v1.0.0-beta.2 (2017-04-17)
    * Create `hello-world` **module** with `GET` **route** and **service** to say hello.
    * Create **tests** for each component and the integration of the module inside [Hapiness](https://github.com/hapinessjs/hapiness) application.
    * Module **guideline** style.
    * Documentation.
    * Module version related to core version
    
[Back to top](#table-of-contents)

## Maintainers

<table>
    <tr>
        <td colspan="4" align="center"><a href="https://www.tadaweb.com"><img src="https://tadaweb.com/images/tadaweb/logo.png" width="117" alt="tadaweb" /></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil"><img src="https://avatars3.githubusercontent.com/u/6546204?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/antoinegomez"><img src="https://avatars3.githubusercontent.com/u/997028?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/srz09"><img src="https://avatars3.githubusercontent.com/u/6841511?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/njl07"><img src="https://avatars3.githubusercontent.com/u/1673977?v=3&s=117" width="117"/></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil">Julien Fauville</a></td>
        <td align="center"><a href="https://github.com/antoinegomez">Antoine Gomez</a></td>
        <td align="center"><a href="https://github.com/srz09">Sébastien Ritz</a></td>
        <td align="center"><a href="https://github.com/njl07">Nicolas Jessel</a></td>
    </tr>
</table>

[Back to top](#table-of-contents)

## License

Copyright (c) 2017 **Hapiness** Licensed under the [MIT license](https://github.com/hapinessjs/empty-module/blob/master/LICENSE.md).

[Back to top](#table-of-contents)
