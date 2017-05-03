import { Component, PropTypes, createElement } from 'react';

const defaultDispatch = (state, message) => {
    const newData = [
        message.toString(),
        ...this.state.data
    ];
    this.setState({data: newData});
};


export default function subscribe(opts = {dispatch: defaultDispatch}) {
    const { topic, dispatch } = opts;


    return (TargetComponent) => {
        class MQTTSubscriber extends Component {
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
                    ...this.props,
                    data: this.state.data,
                    mqtt: this.client
                });
            }

            subscribe() {
                this.client.subscribe(topic);
                this.client.on('message', this.handleMessage);
                this.setState({ subscribed: true });
            }

            unsubscribe() {
                this.client.unsubscribe(topic);
                this.setState({ subscribed: false });
                //@todo: Unsubscribe handleMessage
            }

            handleMessage = (topic, message, packet) => {
                dispatch.apply(this, [message, packet]);
            };
        }
        return MQTTSubscriber;
    }
}