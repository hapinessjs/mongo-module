/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';

// element to test
import { MongoManagerService } from '../../src';

@suite('- Unit MongoManagerServiceTest file')
class MongoManagerServiceTest {
    // private property to store service instance
    private _mongoManagerService: MongoManagerService;

    /**
     * Function executed before the suite
     */
    static before() {}

    /**
     * Function executed after the suite
     */
    static after() {}

    /**
     * Class constructor
     * New lifecycle
     */
    constructor() {}

    /**
     * Function executed before each test
     */
    before() {
        this._mongoManagerService = new MongoManagerService();
    }

    /**
     * Function executed after each test
     */
    after() {
        this._mongoManagerService = undefined;
    }

    /**
     * Test if `HelloWorldService` as a `sayHello` function
     */
    @test('- `HelloWorldService` must have `sayHello` function')
    testHelloWorldServiceSayHello() {
        unit.function(this._mongoManagerService.sayHello);
    }

    /**
     * Test if `HelloWorldService.sayHello()` function returns an Observable
     */
    @test('- `HelloWorldService.sayHello()` function must return an Observable')
    testHelloWorldServiceSayHelloObservable() {
        unit.object(this._mongoManagerService.sayHello()).isInstanceOf(Observable);
    }
    /**
     * Test if `HelloWorldService.sayHello()` Observable returns 'Hello World'
     */
    @test('- `HelloWorldService.sayHello()` Observable function must return a string with `Hello World` value')
    testHelloWorldServiceSayHelloObservableReturnString(done) {
        this._mongoManagerService.sayHello().subscribe(m => unit.string(m).is('Hello World').when(_ => done()));
    }
}
