const _topics = {};
const _lastMessage = {};

const ReactMQTT = {
  subscribe: topics => {
    if(!Array.isArray(topics)) topics = [topics]
    topics.forEach(topic => {
      if(!_topics[topic]) _topics[topic] = 1
      else _topics[topic] += 1
    });
  },
  unsubscribe: topics => {
    let unsubscribeFromTopics = []
    if(!Array.isArray(topics)) topics = [topics]
    topics.forEach(topic => {
      if(_topics[topic]) _topics[topic] -= 1
      if(!_topics[topic]) {
        // Remove the last message because no longer subscribed.
        // A new subscription will fill this again when retain = true
        // otherwise when a change happens.
        delete _lastMessage[topic]
        unsubscribeFromTopics.push(topic)
      }
    });

    return unsubscribeFromTopics
  },
  lastmessage: (topic, message, packet) => {
    if(message && packet) {
      // Set the last message
      _lastMessage[topic] = {
        message: message,
        packet: packet
      }
    } else if(_lastMessage[topic]) {
      // Get the last message
      return {
        topic: topic,
        message: _lastMessage[topic].message,
        packet: _lastMessage[topic].packet
      }
    } else {
      // Trying to get a non-existing message. Return empty object.
      return {}
    }
  }
}

Object.freeze(ReactMQTT);
export default ReactMQTT;
