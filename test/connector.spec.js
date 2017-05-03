import {describe} from "ava-spec";
import React from "react";
import {shallow} from "enzyme";
import {EventEmitter} from "events";
import Connector from "../src/connector";


describe('Connector', (test) => {
    const DIV_ID = 'content';
    test('should render children', (t) => {
        const mockMQTT = new EventEmitter();
        const mounted = shallow(
            <Connector mqqt={mockMQTT}>
                <div id={DIV_ID}/>
            </Connector>
        )
        t.true(mounted.find(`div#${DIV_ID}`).length === 1);
    })

});
