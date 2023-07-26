//TopicBox.vue

<template>
  <div v-if="topic" class="topic-box">
    <div class="topic-content" @click="goToTopic">
      <img :src="topic.image" alt="Topic image" class="topic-image" />
      <h2 class="topic-title">{{ topic.title }}</h2>
      <p class="topic-text">{{ topic.text }}</p>
    </div>
    <div class="like-bar">
      <div
        class="section"
        v-for="group in sortedGroups"
        :key="group"
        :style="{ width: groupWidths[group] + '%', backgroundColor: groupColors[group] }"
        @click="showPopup(group)"
      >
        <div v-if="popupGroup === group" class="popup">
          {{ groupWidths[group] }}%
        </div>
      </div>
    </div>
    <button @click="like(1)" :style="{ backgroundColor: getPartyColor(currentUser.party) }">Like</button>
  </div>
  <div v-else>
    <!-- Placeholder content while topic is loading, or error message if topic couldn't be loaded -->
    <p>Loading topic...</p>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { iconColor } from './farben';


export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['getTopicById']),


    currentUser() {
      return this.$store.getters.getUserProfile;
    },

    topic() {
      return this.getTopicById(this.id);
    },
    totalLikes() {
      // Überprüfen Sie, ob das "topic" Objekt definiert ist, bevor Sie auf "topic.likes" zugreifen
      if (!this.topic) return 0;

      return Object.values(this.topic.likes).reduce((sum, value) => sum + value, 0);
    },
    groupWidths() {
      // Überprüfen Sie, ob das "topic" Objekt definiert ist, bevor Sie auf "topic.likes" zugreifen
      if (!this.topic) return {};

      let widths = {};
      for (let group in this.topic.likes) {
        widths[group] = ((this.topic.likes[group] / this.totalLikes) * 100).toFixed(1);
      }
      return widths;
    },
    groupColors() {
      return {
        '-4': 'dodgerblue',
        '-3': 'cornflowerblue',
        '-2': 'deepskyblue',
        '-1': 'skyblue',
        '1': 'gold',
        '2': 'goldenrod',
        '3': 'orange',
        '4': 'red',
      };
    },
    sortedGroups() {
      return ['-4', '-3', '-2', '-1', '1', '2', '3', '4'];
    },
  },
  data() {
    return {
      popupGroup: null,
    };
  },
  methods: {


  
    like(group) {
    const userParty = this.currentUser.party;
    this.toggleLike({ topicId: this.id, group });
  },
    getPartyColor(party) {
      return iconColor(party);
    },
    goToTopic(event) {
      const targetElement = event.target;

      // Überprüfen, ob auf das Bild oder die Box geklickt wurde
      if (
        targetElement.classList.contains('topic-image') ||
        targetElement.classList.contains('topic-content')||
        targetElement.classList.contains('topic-title')||
           targetElement.classList.contains('topic-content')
      ) {
        this.$router.push(`/topic/${this.id}`);
      }
    },
    
    // Vuex-Mutation zum Aktualisieren der Likes aufrufen

    showPopup(group) {
      this.popupGroup = group;
    },
    ...mapMutations(['UPDATE_LIKES']), // Füge die Mutation-Map hinzu, um die Vuex-Mutation aufzurufen
  },
};
</script>

<style lang="scss" scoped>

.like-button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background-color: #3498db;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
}

.topic-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #a39b9b;
}
.topic-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 20px auto;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  .topic-image {
    
    height: 100px;
    object-fit: cover;
  }

  .topic-title {
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }

  .topic-text {
    margin: 10px 0;
    text-align: justify;
    color: #333;
  }

  .like-bar {
    display: flex;
    width: 100%;
    height: 20px;
    margin: 20px 0;
    align-items: flex-end;

    .section {
      height: 100%;
      position: relative;

      .popup {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fff;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        color: #000;
      }
    }
  }

  button {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    background-color: #3498db;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #2980b9;
    }
  }
}
</style>
