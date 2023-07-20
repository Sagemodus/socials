<template>
  <div class="public-component">
    <TopicBox v-for="topic in topics" :key="topic.id" :image="topic.image" :title="topic.title" :text="topic.text" :likes="topic.likes" />
  </div>
</template>

<script>
import TopicBox from '../components/TopicBox.vue';
import { fetchDataFromDatabase } from '../firebase/dataFetcher';

export default {
  components: {
    TopicBox
  },
  data() {
    return {
      topics: []
    };
  },
  created() {
    this.fetchTopics();
  },
  methods: {
    fetchTopics() {
      fetchDataFromDatabase()
        .then(data => {
          this.topics = data;
        })
        .catch(error => {
          console.error('Fehler beim Abrufen der Daten:', error);
        });
    }
  }
}
</script>

<style scoped>
.public-component {
  /* Stilisierung der PublicComponent */
}
</style>
