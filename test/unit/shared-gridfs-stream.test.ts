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
import { CreateGridFsStream } from '../../src/module/shared';

@suite('- Unit Shared#GridFsStream file')
class SharedGridFsStreamTest {
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

    }

    /**
     * Function executed after each test
     */
    after() {

    }

    /**
     *  `CreateGridFsStream` must throw if `db` is null
     */
    @test('- `CreateGridFsStream` must throw if `db` is null')
    testUtilFunctionsGetMongoUriIsFunction() {
        unit
            .assert
            .throws(
                () => CreateGridFsStream(undefined, {}),
                (err) => {
                    if (!!err && !!err.message) {
                        return true;
                    }

                    return false;
                }
            );
    }
}
