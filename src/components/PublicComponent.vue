<template>
  <div>
    <!-- Loop through the data and create TopicBox components for each topic -->
    <TopicBox
      v-for="topic in sortedTopics.slice()"
      :key="topic.id"
      :id="topic.id"
    />
  </div>
</template>

<script>

import { mapState } from 'vuex';
import TopicBox from './TopicBox'; // Make sure to adjust the path accordingly

export default {
  components: {
    TopicBox,
  },
  computed: {
    ...mapState({

      topics: state => state.topics // Dies bringt den topics-State aus dem Store in Ihre Komponente
    }),
    sortedTopics() {
      return this.topics.slice().sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }


  },

  methods: {
    handleTopicClick(topicId) {
      // Get the ID of the clicked topic.
      // Now navigate to TopicComponentGanzeSeite.vue and pass the ID as a parameter in the route.
      this.$router.push({ name: 'TopicDetails', params: { id: topicId } });
    }
  },
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>
