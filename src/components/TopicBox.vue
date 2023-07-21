//TopicBox.vue

<template>

<div v-if="topic" class="topic-box" @click="goToTopic">
    <img :src="topic.image" alt="Topic image" class="topic-image" />
    <h2 class="topic-title">{{ topic.title }}</h2>
    <p class="topic-text">{{ topic.text }}</p>
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
    <button @click="like">Like</button>
  </div>
  <div v-else>
    <!-- Placeholder content while topic is loading, or error message if topic couldn't be loaded -->
    <p>Loading topic...</p>
  </div>
</template>

<script>


import { mapGetters, mapMutations } from 'vuex';

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  computed: {
  ...mapGetters(['getTopicById']),
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
  methods: {
    goToTopic() {
      this.$router.push(`/topic/${this.id}`);
    },
    // Vuex-Mutation zum Aktualisieren der Likes aufrufen
    like() {
      // Annahme: Du möchtest die Likes um 1 erhöhen
      const updatedLikes = { ...this.topic.likes };
      updatedLikes['1'] += 1;

      // Aufruf der Vuex-Mutation "UPDATE_LIKES" mit der aktualisierten Like-Daten
      this.UPDATE_LIKES({ id: this.id, likes: updatedLikes });
    },
    showPopup(group) {
      this.popupGroup = group;
    },
    ...mapMutations(['UPDATE_LIKES']), // Füge die Mutation-Map hinzu, um die Vuex-Mutation aufzurufen
  },
};
</script>

<style lang="scss" scoped>
.topic-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 20px auto;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  .topic-image {
    border-radius: 50%;
    width: 100px;
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
