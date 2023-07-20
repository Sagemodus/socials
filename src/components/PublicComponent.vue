<template>
  <div class="public-component">
    <TopicBox
      v-for="topic in topics"
      :key="topic.id"
      :image="topic.image"
      :title="topic.title"
      :text="topic.text"
      :likes="topic.likes"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import TopicBox from '../components/TopicBox.vue';
import { fetchDataFromDatabase } from '../firebase/dataFetcher';

export default {
  components: {
    TopicBox
  },
  setup() {
    const topics = ref([]);

    const fetchTopics = async () => {
      try {
        topics.value = await fetchDataFromDatabase();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    onMounted(fetchTopics);

    return {
      topics
    };
  }
}
</script>

<style scoped>
  /* Styles here */
</style>
