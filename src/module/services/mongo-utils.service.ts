import { ObjectID } from 'mongodb';

export class MongoUtils {

    public static toObjectId(id: string) {
        try {
            return new ObjectID(id);
        } catch (err) {
            return undefined;
        }
    }

    public static prepareUpdateObject(dto: any): any {
        if (!dto || !Object.keys(dto).length) {
            return {};
        }

        const preparedObject: any = {};

        Object
            .keys(dto)
            .forEach(rootKey => {
                if (!!dto[rootKey] && typeof dto[rootKey] === 'object') {
                    Object
                        .keys(dto[rootKey])
                        .forEach(
                            childKey => {
                                preparedObject[`${rootKey}.${childKey}`] = dto[rootKey][childKey];
                            }
                        );
                } else {
                    preparedObject[rootKey] = dto[rootKey];
                }
            });

        return preparedObject;
    }

    static filterFindCondition(condition: any): any {
        if (condition.id || condition._id) {
            condition._id = MongoUtils.toObjectId(condition.id || condition._id);
            delete condition.id;
        }

        return condition;
    }

    static fieldsStringFromArray(fields: string[]): string {
        if (!fields || !fields.length) {
            return '';
        }

        return fields.filter(f => !!f && f.trim().length).map(f => f.trim()).join(' ');
    }
}
