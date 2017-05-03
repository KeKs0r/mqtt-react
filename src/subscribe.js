import {Component, createElement} from "react";
import PropTypes from "prop-types";
import omit from "object.omit";

function defaultDispatch(topic, message, packet) {
    const { state } = this;
    const newData = [
        message.toString(),
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
            }


            componentWillMount() {
                this.subscribe();
            }

            componentWillUnmount() {
                // make sure to dispose all subscriptions
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
                this.client.on('message', dispatch.bind(this));
                this.setState({ subscribed: true });
            }

            unsubscribe() {
                this.client.unsubscribe(topic);
                this.setState({ subscribed: false });
                //@todo: Unsubscribe handleMessage
            }

        }
        return MQTTSubscriber;
    }
}