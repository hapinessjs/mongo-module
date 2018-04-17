/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

// element to test
import { MongoUtils } from '../../src/module/services';

@suite('- Unit MongoUtilTest file')
export class MongoUtilTest {

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
     * `MongoUtils` function `toObjectId` should succeed
     */
    @test('- `MongoUtils` function `toObjectId` should succeed')
    testMongoUtilToObjectIdOk() {
        unit
            .string(
                MongoUtils
                    .toObjectId('596731037e58000100644adb')
                    .toHexString()
            )
            .is('596731037e58000100644adb');
    }

    /**
     * `MongoUtils` function `toObjectId` should failed and return undefined
     */
    @test('- `MongoUtils` function `toObjectId` should failed and return undefined')
    testMongoUtilToObjectIdFailed() {
        unit
            .undefined(MongoUtils.toObjectId('1234'));
    }

    /**
     * `MongoUtils` function `prepareUpdateObject` should return empty object because of null arg
     */
    @test('- `MongoUtils` function `prepareUpdateObject` should return empty object because of null arg')
    testMongoUtilPrepareUpdateObjectNullArgs() {
        unit
            .object(MongoUtils.prepareUpdateObject(null))
            .is({});
    }

    /**
     * `MongoUtils` function `prepareUpdateObject` should return empty object because of empty arg
     */
    @test('- `MongoUtils` function `prepareUpdateObject` should return empty object because of empty arg')
    testMongoUtilPrepareUpdateObjecEmptyArgs() {
        unit
            .object(MongoUtils.prepareUpdateObject({}))
            .is({});
    }

    /**
     * `MongoUtils` function `prepareUpdateObject` should return an unfold object (1)
     */
    @test('- `MongoUtils` function `prepareUpdateObject` should return an unfold object (1)')
    testMongoUtilPrepareUpdateObjecUnfoldObject1() {
        unit
            .object(
                MongoUtils
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
     * `MongoUtils` function `prepareUpdateObject` should return an unfold object (2)
     */
    @test('- `MongoUtils` function `prepareUpdateObject` should return an unfold object (2)')
    testMongoUtilPrepareUpdateObjecUnfoldObject2() {
        unit
            .object(
                MongoUtils
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
     * `MongoUtils` function `prepareUpdateObject` should return an unfold object (3)
     */
    @test('- `MongoUtils` function `prepareUpdateObject` should return an unfold object (3)')
    testMongoUtilPrepareUpdateObjecUnfoldObject3() {
        const dateObject = new Date();
        unit
            .object(
                MongoUtils
                    .prepareUpdateObject(
                        {
                            test1: 'value',
                            test2: {
                                key1: 'value1'
                            },
                            test3: {
                                key1: {
                                    key2: {
                                        key3: {
                                            key4: {
                                                key5: 'value2'
                                            }
                                        },
                                        key6: 'value3'
                                    }
                                },
                                key7: {
                                    key8: 'value4'
                                },
                                key8: 'value5',
                                key9: dateObject,
                                key10: [1, 2, 3, 4, 5, 6]
                            }
                        }
                    )
            )
            .is({
               test1: 'value',
               'test2.key1': 'value1',
               'test3.key1.key2.key3.key4.key5': 'value2',
               'test3.key1.key2.key6': 'value3',
               'test3.key7.key8': 'value4',
               'test3.key8': 'value5',
               'test3.key9': dateObject,
               'test3.key10': [1, 2, 3, 4, 5, 6]
              });
    }

    /**
     * `MongoUtils` function `filterFindCondition` without id or _id should return the object
     */
    @test('- `MongoUtils` function `filterFindCondition` without id or _id should return the object')
    testMongoUtilFilterFindConditionNoIdNorLodashId() {
        unit
            .object(
                MongoUtils
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
     * `MongoUtils` function `filterFindCondition` with a string _id should return an object with _id as an ObjectID
     */
    @test('- `MongoUtils` function `filterFindCondition` with a string _id should return an object with _id as an ObjectID')
    testMongoUtilFilterFindConditionWithStringLodashId() {
        const res =  MongoUtils.filterFindCondition(
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
     * `MongoUtils` function `filterFindCondition` with a string id should return an object with _id as an ObjectID
     */
    @test('- `MongoUtils` function `filterFindCondition` with a string _id should return an object with _id as an ObjectID')
    testMongoUtilFilterFindConditionWithStringId() {
        const res =  MongoUtils.filterFindCondition(
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
     * `MongoUtils` function `fieldsStringFromArray` should return empty string if no fields given
     */
    @test('- `MongoUtils` function `fieldsStringFromArray` should return empty string if no fields given')
    testMongoUtilFieldsStringFromArrayReturnEmptyStringBecauseIfNullParam() {
        unit
            .string(MongoUtils.fieldsStringFromArray(null))
            .is('');
    }

    /**
     * `MongoUtils` function `fieldsStringFromArray` should return empty string if empty array given
     */
    @test('- `MongoUtils` function `fieldsStringFromArray` should return empty string if empty array given')
    testMongoUtilFieldsStringFromArrayReturnEmptyStringBecauseIfEmptyArray() {
        unit
            .string(MongoUtils.fieldsStringFromArray([]))
            .is('');
    }

    /**
     * `MongoUtils` function `fieldsStringFromArray` should return empty string if bad values
     */
    @test('- `MongoUtils` function `fieldsStringFromArray` should return empty string if bad values')
    testMongoUtilFieldsStringFromArrayReturnEmptyStringBecauseIfBadValues() {
        unit
            .string(MongoUtils.fieldsStringFromArray([null, '', '      ']))
            .is('');
    }

    /**
     * `MongoUtils` function `fieldsStringFromArray` should return a space separated list of fields
     */
    @test('- `MongoUtils` function `fieldsStringFromArray` should return a space separated list of fields')
    testMongoUtilFieldsStringFromArrayReturnSpaceSeparatedListOfFields() {
        unit
            .string(MongoUtils.fieldsStringFromArray(['test', 'micro']))
            .is('test micro');
    }
}
