import { describe } from 'ava-spec';
import React from 'react';
import { shallow } from 'enzyme';
import Sinon from 'sinon';

import subscribe from '../src/subscribe';
import events from 'eventemitter';


class mockClient extends events.EventEmitter {
    subscribe = Sinon.spy();
    publish = Sinon.spy((topic, message) => {
        const bufferMessage = Buffer.from(message);
        this.emit('message', topic, bufferMessage);
    });
}

describe('Subscribe', (test) => {
    const demoTopic = '@test/demo';

    test('passes on the client', (t) => {
        var stub = new mockClient();
        const  SubscribedComponent = subscribe({topic:demoTopic})("div");
        const mounted = shallow(
            <SubscribedComponent client={stub} />
        );
        t.truthy(mounted.first().prop('mqtt'));
    })

    test('can subscribe to topic', (t) => {
        var stub = new mockClient();
        const  SubscribedComponent = subscribe({topic:demoTopic})("div");
        shallow(
            <SubscribedComponent client={stub} />
        );
        t.true(stub.subscribe.calledWith(demoTopic));
    })


    test('receives data and passes it to component', (t) => {
        var stub = new mockClient();
        const  SubscribedComponent = subscribe({topic: demoTopic})("div");
        const demoMessage = 'my message';
        const mounted = shallow(
            <SubscribedComponent client={stub} />
        );
        stub.publish(demoTopic, demoMessage);
        const data = mounted.first().prop('data');
        t.true(data[0] === demoMessage);
    })


});
