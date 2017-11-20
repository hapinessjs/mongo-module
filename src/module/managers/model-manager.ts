import { Type } from '@hapiness/core';

export class ModelItem {
    token: Type<any>;
    value: any;
}

export class ModelManager {

    private models: ModelItem[] = [];

    public add(item: ModelItem) {
        if (!item) {
            throw new Error('ModelManager - Cannot add empty item');
        }
        this.models.push(item);
    }

    public get(token: Type<any>) {
        const item = this.models.find(_ => _.token === token);
        return item ? item.value : undefined;
    }
}
