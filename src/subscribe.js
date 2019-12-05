import {Component, createElement} from "react";
import PropTypes from "prop-types";
import omit from "object.omit";
import ReactMQTT from "./react-mqtt"


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
    const { topic, debug } = opts;
    const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;

    return (TargetComponent) => {
        class MQTTSubscriber extends Component {
            static propTypes = {
                client: PropTypes.object
            }
            static contextTypes = {
                mqtt: PropTypes.object
            };

            updateMessage = (topic, message, packet) => {
                let { subscribedToTopic } = this.state
                if((Array.isArray(subscribedToTopic) && subscribedToTopic.indexOf(topic) !== -1) || (!Array.isArray(subscribedToTopic) && subscribedToTopic === topic)) {
                    if(debug) console.info('Message for : ' + topic)
                    ReactMQTT.lastmessage(topic, message, packet)
                    this.handler(topic, message, packet)
                }
            }

            constructor(props, context) {
                super(props, context);

                this.client = props.client || context.mqtt;
                this.state = {
                    subscribed: false,
                    subscribedToTopic: '',
                    data: [],
                };
                this.handler = dispatch.bind(this)
                this.client.on('message', this.updateMessage)
            }


            componentDidMount() {
                if(debug) console.info('Subscribed to : ' + topic)
                this.subscribe();
            }

            componentWillUnmount() {
                if(debug) console.info('Unsubscribed from : ' + topic)
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
                // Get the last message when subscribing to a topic that is already
                // subscribed to. This is needed to show the same information in multiple
                // elements that subscribe to the same topic.
                let lastMessages = ReactMQTT.lastmessage(topic)
                lastMessages.forEach(lastmessage => {
                    this.handler(lastmessage.topic, lastmessage.message, lastmessage.packet)
                });
                // Let the ReactMQTT helper function know we are subscribing to a topic.
                // This increases the counter.
                ReactMQTT.subscribe(topic);
                this.client.subscribe(topic);
                this.setState({
                    subscribed: true,
                    subscribedToTopic: topic
                });
            }

            unsubscribe() {
                let unsubscribeFrom = []
                // Let the ReactMQTT helper know we want to unsubscribe from topic. This
                // will decrease a counter for this topic. When the counter reaches 0 the
                // client.unsubscribe function will be called with this topic.
                if(unsubscribeFrom = ReactMQTT.unsubscribe(topic)) {
                    unsubscribeFrom.length > 0 && this.client.unsubscribe(unsubscribeFrom);
                }
                this.client.removeListener('message', this.updateMessage)
                this.setState({
                    subscribed: false,
                    subscribedToTopic: ''
                });
            }

        }
        return MQTTSubscriber;
    }
}