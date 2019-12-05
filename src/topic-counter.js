const _topics = {};
const _lastMessage = {};

const TopicCounter = {
  subscribe: topics => {
    if(!Array.isArray(topics)) topics = [topics]
    topics.forEach(topic => {
      if(!_topics[topic]) _topics[topic] = 1
      else _topics[topic] += 1
    });
    console.info(_topics)
  },
  unsubscribe: topics => {
    let unsubscribeFromTopics = []
    if(!Array.isArray(topics)) topics = [topics]
    topics.forEach(topic => {
      if(_topics[topic]) _topics[topic] -= 1
      if(!_topics[topic]) unsubscribeFromTopics.push(topic)
    });

    console.info(_topics)
    return unsubscribeFromTopics
  }
  // Make a last message saver. This is needed for saving the last message
  // received. This way the last message can be set again when no resubscription occurred.
}

Object.freeze(TopicCounter);
export default TopicCounter;
