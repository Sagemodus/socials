import { createStore } from 'vuex';

function generateTopics(count) {
  const topics = [];
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const newTopic = {
      id,
      image: `https://fakeimg.pl/250x100/?text=Topic${id}&font=lobster`,
      title: `Fake Topic ${id}`,
      text: `This is a description for fake topic ${id}.`,
      likes: {
        '-4': Math.floor(Math.random() * 100),
        '-3': Math.floor(Math.random() * 100),
        '-2': Math.floor(Math.random() * 100),
        '-1': Math.floor(Math.random() * 100),
        '1': Math.floor(Math.random() * 100),
        '2': Math.floor(Math.random() * 100),
        '3': Math.floor(Math.random() * 100),
        '4': Math.floor(Math.random() * 100),
      },
    };
    topics.push(newTopic);
  }
  return topics;
}

export default createStore({
  state: {
    topics: generateTopics(10),
  },
  mutations: {
    // Vuex-Mutation zum Aktualisieren der Likes
    UPDATE_LIKES(state, payload) {
      const { id, likes } = payload;
      const topicToUpdate = state.topics.find((topic) => topic.id === id);
      if (topicToUpdate) {
        topicToUpdate.likes = likes;
      }
    },
  },
  actions: {
    // Füge hier ggf. weitere Vuex-Aktionen hinzu, um Daten aus der API abzurufen und den State zu aktualisieren
  },
  getters: {
    // ...Andere Getter-Methoden...
    getTopicById: (state) => (id) => {
      return state.topics.find((topic) => topic.id === id);
    },
  },
});
