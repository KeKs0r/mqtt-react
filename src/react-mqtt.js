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
    let result = []
    if(!Array.isArray(topic)) topic = [topic]
    topic.forEach(t => {
      if(message && packet) {
        // Set the last message
        _lastMessage[t] = {
          message: message,
          packet: packet
        }
      } else if(_lastMessage[t]) {
        // Get the last message
        result.push({
          topic: t,
          message: _lastMessage[t].message,
          packet: _lastMessage[t].packet
        })
      }
    });

    return result
  }
}

Object.freeze(ReactMQTT);
export default ReactMQTT;
