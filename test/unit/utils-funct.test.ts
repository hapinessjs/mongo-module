/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

// element to test
import { UtilFunctions } from '../../src';

@suite('- Unit Shared#funct file')
class SharedFunctionsTest {
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
     * Test if `UtilFunctions` as a `getMongoUri` function
     */
    @test('- `UtilFunctions` must have `getMongoUri` function')
    testUtilFunctionsGetMongoUriIsFunction() {
        unit
            .function(UtilFunctions.getMongoUri);
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 1
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 1')
    testUtilFunctionsGetMongoUriCase1() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://mongodb:27017', 'testdb')
            )
            .is('mongodb://mongodb:27017/testdb');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 2
     */
    @test('- `UtilFunctions.getMongoUri(...)`  case 2')
    testUtilFunctionsGetMongoUriCase2() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://mongodb:27017,10.5.6.9:27545,mongodb2', 'testdb')
            )
            .is('mongodb://mongodb:27017,10.5.6.9:27545,mongodb2/testdb');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 3
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 3')
    testUtilFunctionsGetMongoUriCase3() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://webdev.s3.tdw:27017', 'testdb')
            )
            .is('mongodb://webdev.s3.tdw:27017/testdb');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 4
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 4')
    testUtilFunctionsGetMongoUriCase4() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://mongodb', 'testdb')
            )
            .is('mongodb://mongodb/testdb');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 5
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 5')
    testUtilFunctionsGetMongoUriCase5() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://mongodb:27017/roger', 'testdb')
            )
            .is('mongodb://mongodb:27017/testdb');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 6
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 6')
    testUtilFunctionsGetMongoUriCase6() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://mongodb:27017/roger')
            )
            .is('mongodb://mongodb:27017/roger');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 7
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 7')
    testUtilFunctionsGetMongoUriCase7() {
        unit
            .string(
                UtilFunctions.getMongoUri('mongodb://pvadocdb:XuuXiiiXoooWooo==@pvadocdb.documents.azure.com:10250/?ssl=false', 'testdb')
            )
            .is('mongodb://pvadocdb:XuuXiiiXoooWooo==@pvadocdb.documents.azure.com:10250/testdb?ssl=false');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 8
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 8')
    testUtilFunctionsGetMongoUriCase8() {
        const longUri = `mongodb://pvadocdb:XuuXiiiXoooWooo==@pvadocdb.documents.azure.com:10250,backup.mongodb.server:9654/?ssl=false`;

        unit
            .string(
                UtilFunctions.getMongoUri(longUri, 'testdb')
            )
            .is('mongodb://pvadocdb:XuuXiiiXoooWooo==@pvadocdb.documents.azure.com:10250,backup.mongodb.server:9654/testdb?ssl=false');
    }

    /**
     * Test `UtilFunctions.getMongoUri()` case 9
     */
    @test('- `UtilFunctions.getMongoUri(...)` case 9')
    testUtilFunctionsGetMongoUriCase9() {
        unit
            .string(
                UtilFunctions
                    .getMongoUri('mongodb://db1.example.net,db2.example.net:2500/?replicaSet=test&connectTimeoutMS=300000', 'testdb')
            )
            .is('mongodb://db1.example.net,db2.example.net:2500/testdb?replicaSet=test&connectTimeoutMS=300000');
    }
}
