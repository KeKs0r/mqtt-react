import { describe } from 'ava-spec';
import React from 'react';
import { shallow } from 'enzyme';
import Sinon from 'sinon';

import subscribe from '../src/subscribe';
import {EventEmitter} from 'events';


class mockClient extends EventEmitter {
    subscribe = Sinon.spy();
    publish = Sinon.spy((topic, message) => {
        const bufferMessage = Buffer.from(message);
        this.emit('message', topic, bufferMessage);
    });
}

describe('Subscribe', (test) => {
    const demoTopic = '@test/demo';

    test('passes on the client', (t) => {
        const stub = new mockClient();
        const  SubscribedComponent = subscribe({topic:demoTopic})("div");
        const mounted = shallow(
            <SubscribedComponent client={stub} />
        );
        t.truthy(mounted.first().prop('mqtt'));
    });

    test('can subscribe to topic', (t) => {
        const stub = new mockClient();
        const  SubscribedComponent = subscribe({topic:demoTopic})("div");
        shallow(
            <SubscribedComponent client={stub} />
        );
        t.true(stub.subscribe.calledWith(demoTopic));
    });


    test('receives data and passes it to component', (t) => {
        const stub = new mockClient();
        const  SubscribedComponent = subscribe({topic: demoTopic})("div");
        const demoMessage = 'my message';
        const mounted = shallow(
            <SubscribedComponent client={stub} />
        );
        stub.publish(demoTopic, demoMessage);
        const data = mounted.first().prop('data');
        t.true(data[0] === demoMessage);
    });

    test('receives JSON data and parses it', (t) => {
        const stub = new mockClient();
        const  SubscribedComponent = subscribe({topic: demoTopic})("div");
        const demoMessage = {value: 'content'};
        const mounted = shallow(
            <SubscribedComponent client={stub} />
        );
        stub.publish(demoTopic, JSON.stringify(demoMessage));
        const data = mounted.first().prop('data');
        t.truthy(data[0]);
        t.true(data[0].value === demoMessage.value);
    })


});
