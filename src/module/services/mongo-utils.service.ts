import { ObjectID } from 'mongodb';

export class MongoUtils {

    public static toObjectId(id: string) {
        try {
            return new ObjectID(id);
        } catch (err) {
            return undefined;
        }
    }

    public static prepareUpdateObject(dto: any, prefix?: string): any {
        return Object.entries(dto || {}).reduce((acc, [key, value]) => {
            const _key = [prefix, key].filter(item => item).join('.');
            return value && typeof value === 'object' ?
                Object.assign(MongoUtils.prepareUpdateObject(value, _key), acc) :
                Object.assign({ [_key]: value }, acc);
        }, {});
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
