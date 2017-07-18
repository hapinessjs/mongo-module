import { test, suite } from 'mocha-typescript';
import * as unit from 'unit.js';
import { Observable } from 'rxjs/Observable';
import { MongooseMockInstance, ConnectionMock } from '../mocks';
import { ModelManager } from '../../src';

@suite('- Unit DocumentManager file')
class DocumentManagerrTest {

    @test('- Store testing')
    test1() {

        class Token {}

        const store = new ModelManager();
        unit
            .array(store['models'])
            .is([]);

        unit.exception(store.add);

        store.add({
            token: Token,
            value: { test: true }
        })
        unit
            .object(store.get(Token))
            .is({ test: true });

    }
}
