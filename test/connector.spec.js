import { describe } from 'ava-spec';
import React from 'react';
import { shallow } from 'enzyme';

import mockMQTT from 'eventemitter';
import Connector from '../src/connector';


describe('Connector', (test) => {
    const DIV_ID = 'content';
    test('should render children', (t) => {
        const mounted = shallow(
            <Connector mqqt={mockMQTT}>
                <div id={DIV_ID} />
            </Connector>
        )
        t.true(mounted.find(`div#${DIV_ID}`).length === 1);
    })

});
