/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite, only } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs/Observable';

import { AbstractHapinessMongoAdapter } from '../../src/index';


@suite('- Unit MongooseAdapterTest file')
class MongooseAdapterTest {

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
    before() {}

    /**
     * Function executed after each test
     */
    after() {}

    /**
     *  If db already exists it should call `close()` function on it
     */
    @test('- If db already exists it should call `close()` function on it')
    testIfDbAlreadyExistsItShouldCloseIt() {
        /* TODO */
    }

    /**
     * If connection got an error the observer should failed and return the error
     */
    @test('- Instantiate class with an empty config should throw an error')
    testConnectionGotErrorObserverShouldFail() {
        /* TODO */
    }
}
