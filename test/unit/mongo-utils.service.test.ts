/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite, only } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { ReplyNoContinue } from '@hapiness/core';

import { Observable } from 'rxjs/Observable';

// element to test
import { MongoUtil } from '../../src/module/services';

@suite('- Unit MongoUtilTest file')
class MongoUtilTest {

    /**
     * Function executed before the suite
     */
    static before() { }

    /**
     * Function executed after the suite
     */
    static after() { }

    /**
     * Class constructor
     * New lifecycle
     */
    constructor() { }

    /**
     * Function executed before each test
     */
    before() { }

    /**
     * Function executed after each test
     */
    after() { }

    /**
     * `MongoUtil` function `toObjectId` should succeed
     */
    @only
    @test('- `MongoUtil` function `toObjectId` should succeed')
    testMongoUtilToObjectIdOk() {
        unit
            .string(
                MongoUtil
                    .toObjectId('596731037e58000100644adb')
                    .toHexString()
            )
            .is('596731037e58000100644adb');
    }

    /**
     * `MongoUtil` function `toObjectId` should failed and return undefined
     */
    @only
    @test('- `MongoUtil` function `toObjectId` should failed and return undefined')
    testMongoUtilToObjectIdFailed() {
        unit
            .undefined(MongoUtil.toObjectId('1234'));
    }

    /**
     * `MongoUtil` function `prepareUpdateObject` should return empty object because of null arg
     */
    @only
    @test('- `MongoUtil` function `prepareUpdateObject` should return empty object because of null arg')
    testMongoUtilPrepareUpdateObjectNullArgs() {
        unit
            .object(MongoUtil.prepareUpdateObject(null))
            .is({});
    }

    /**
     * `MongoUtil` function `prepareUpdateObject` should return empty object because of empty arg
     */
    @only
    @test('- `MongoUtil` function `prepareUpdateObject` should return empty object because of empty arg')
    testMongoUtilPrepareUpdateObjecEmptyArgs() {
        unit
            .object(MongoUtil.prepareUpdateObject({}))
            .is({});
    }

    /**
     * `MongoUtil` function `prepareUpdateObject` should return an unfold object (1)
     */
    @only
    @test('- `MongoUtil` function `prepareUpdateObject` should return an unfold object (1)')
    testMongoUtilPrepareUpdateObjecUnfoldObject1() {
        unit
            .object(
                MongoUtil
                    .prepareUpdateObject(
                        {
                            test1: {
                                key1: 'value1'
                            }
                        }
                    )
            )
            .is(
                {
                    'test1.key1': 'value1'
                }
            );
    }

    /**
     * `MongoUtil` function `prepareUpdateObject` should return an unfold object (2)
     */
    @only
    @test('- `MongoUtil` function `prepareUpdateObject` should return an unfold object (2)')
    testMongoUtilPrepareUpdateObjecUnfoldObject2() {
        unit
            .object(
                MongoUtil
                    .prepareUpdateObject(
                        {
                            test1: 'value',
                            test2: {
                                key1: 'value1'
                            }
                        }
                    )
            )
            .is({
                test1: 'value',
                'test2.key1': 'value1'
            });
    }

    /**
     * `MongoUtil` function `filterFindCondition` without id or _id should return the object
     */
    @only
    @test('- `MongoUtil` function `filterFindCondition` without id or _id should return the object')
    testMongoUtilFilterFindConditionNoIdNorLodashId() {
        unit
            .object(
                MongoUtil
                    .filterFindCondition(
                        {
                            test1: 'value'
                        }
                    )
            )
            .is(
                {
                    test1: 'value'
                }
            );
    }

    /**
     * `MongoUtil` function `filterFindCondition` with a string _id should return an object with _id as an ObjectID
     */
    @only
    @test('- `MongoUtil` function `filterFindCondition` with a string _id should return an object with _id as an ObjectID')
    testMongoUtilFilterFindConditionWithStringLodashId() {
        const res =  MongoUtil.filterFindCondition(
            {
                _id: '597080480230e0a6bda4eae4',
                test: { micro: 'value' }
            }
        );

        unit
            .string(res._id.toHexString())
            .is('597080480230e0a6bda4eae4');

        unit
            .object(res.test)
            .is({ micro: 'value' });
    }

    /**
     * `MongoUtil` function `filterFindCondition` with a string id should return an object with _id as an ObjectID
     */
    @only
    @test('- `MongoUtil` function `filterFindCondition` with a string _id should return an object with _id as an ObjectID')
    testMongoUtilFilterFindConditionWithStringId() {
        const res =  MongoUtil.filterFindCondition(
            {
                id: '597080480230e0a6bda4eae4',
                test: { micro: 'value' }
            }
        );

        unit
            .string(res._id.toHexString())
            .is('597080480230e0a6bda4eae4');

        unit
            .object(res.test)
            .is({ micro: 'value' });

        unit
            .value(res.id)
            .isUndefined();
    }

    /**
     * `MongoUtil` function `fieldsStringFromArray` should return empty string if no fields given
     */
    @only
    @test('- `MongoUtil` function `fieldsStringFromArray` should return empty string if no fields given')
    testMongoUtilFieldsStringFromArrayReturnEmptyStringBecauseIfNullParam() {
        unit
            .string(MongoUtil.fieldsStringFromArray(null))
            .is('');
    }

    /**
     * `MongoUtil` function `fieldsStringFromArray` should return empty string if empty array given
     */
    @only
    @test('- `MongoUtil` function `fieldsStringFromArray` should return empty string if empty array given')
    testMongoUtilFieldsStringFromArrayReturnEmptyStringBecauseIfEmptyArray() {
        unit
            .string(MongoUtil.fieldsStringFromArray([]))
            .is('');
    }

    /**
     * `MongoUtil` function `fieldsStringFromArray` should return empty string if bad values
     */
    @only
    @test('- `MongoUtil` function `fieldsStringFromArray` should return empty string if bad values')
    testMongoUtilFieldsStringFromArrayReturnEmptyStringBecauseIfBadValues() {
        unit
            .string(MongoUtil.fieldsStringFromArray([null, '', '      ']))
            .is('');
    }

    /**
     * `MongoUtil` function `fieldsStringFromArray` should return a space separated list of fields
     */
    @only
    @test('- `MongoUtil` function `fieldsStringFromArray` should return a space separated list of fields')
    testMongoUtilFieldsStringFromArrayReturnSpaceSeparatedListOfFields() {
        unit
            .string(MongoUtil.fieldsStringFromArray(['test', 'micro']))
            .is('test micro');
    }
}
