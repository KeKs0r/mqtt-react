import {Component, createElement} from "react";
import PropTypes from "prop-types";
import omit from "object.omit";
import TopicCounter from "./topic-counter"


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
                TopicCounter.subscribe(topic);
                this.client.subscribe(topic);
                this.setState({
                    subscribed: true,
                    subscribedToTopic: topic
                });
            }

            unsubscribe() {
                let unsubscribeFrom = []
                if(unsubscribeFrom = TopicCounter.unsubscribe(topic)) {
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