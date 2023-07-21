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
import { getFirestore } from 'firebase/firestore'; // Import getFirestore to directly access Firestore instance

export default {
  components: {
    TopicBox
  },
  setup() {
    const topics = ref([]);

    const fetchTopics = async () => {
      try {
        // Access the Firestore instance directly
        const firestore = getFirestore();

        // Use fetchDataFromDatabase and pass the Firestore instance
        topics.value = await fetchDataFromDatabase(firestore);
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
