import {Component, createElement} from "react";
import PropTypes from "prop-types";
import omit from "object.omit";


function parse(message) {
    try {
        const item = JSON.parse(message);
        return item;
    } catch (e) {
        return message.toString();
    }
}

function defaultDispatch(topic, message, packet) {
    const { state } = this;
    const m = parse(message);
    const newData = [
        m,
        ...state.data
    ];
    this.setState({ data: newData });
};


export default function subscribe(opts = { dispatch: defaultDispatch }) {
    const { topic } = opts;
    const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;

    return (TargetComponent) => {
        class MQTTSubscriber extends Component {
            static propTypes = {
                client: PropTypes.object
            }
            static contextTypes = {
                mqtt: PropTypes.object
            };

            constructor(props, context) {
                super(props, context);

                this.client = props.client || context.mqtt;
                this.state = {
                    subscribed: false,
                    data: [],
                };
                this.handler = dispatch.bind(this)
                this.client.on('message', this.handler);
            }


            componentWillMount() {
                this.subscribe();
            }

            componentWillUnmount() {
                this.unsubscribe();
            }

            render() {
                return createElement(TargetComponent, {
                    ...omit(this.props, 'client'),
                    data: this.state.data,
                    mqtt: this.client
                });
            }

            subscribe() {
                this.client.subscribe(topic);
                this.setState({ subscribed: true });
            }

            unsubscribe() {
                this.client.unsubscribe(topic);
                this.setState({ subscribed: false });
            }

        }
        return MQTTSubscriber;
    }
}