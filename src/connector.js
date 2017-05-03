import {PropTypes, Component, createElement, Children} from "react";
import mqtt from "mqtt";

export default class Connector extends Component {
    static propTypes = {
        mqttProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        children: PropTypes.element.isRequired,
        loadingComponent: PropTypes.element,
    };

    static childContextTypes = {
        mqtt: PropTypes.object,
    };

    constructor(props, context) {
        super(props, context);

        const initialState = {};
        this.state = initialState;
    }

    getChildContext() {
        return {
            mqtt: this.mqtt,
        };
    }

    componentWillMount() {
        const { mqttProps } = this.props;

        this.mqtt = mqtt.connect(mqttProps);
        global._mqtt = this.mqtt;

        this.mqtt.on('connect', this._makeStatusHandler('connected'));
        this.mqtt.on('reconnect', this._makeStatusHandler('reconnect'));
        this.mqtt.on('close',  this._makeStatusHandler('closed'));
        this.mqtt.on('offline', this._makeStatusHandler('offline'));
        this.mqtt.on('error', console.error);


    }

    componentWillUnmount(){
        this.mqtt.end();
    }

    _makeStatusHandler = (status) => {
        return () => {
            console.log('status:'+ status);
            this.setState({ mqttStatus: status })
        }
    };

    render() {
        return this.state.mqttStatus === 'connected'
            ? this.renderConnected()
            : this.renderLoading();
    }

    renderConnected() {
        return Children.only(this.props.children);
    }

    renderLoading() {
        return this.props.loadingComponent
            ? createElement(this.props.loadingComponent)
            : null;
    }
}