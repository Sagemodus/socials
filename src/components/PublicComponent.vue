<template>
  <div>
    <!-- Loop through the data and create TopicBox components for each topic -->
    <TopicBox
      v-for="topic in topics"
      :key="topic.id"
      :id="topic.id"
    
    />
  </div>
</template>

<script>
<<<<<<< HEAD
import { mapState } from 'vuex';
import TopicBox from './TopicBox'; // Make sure to adjust the path accordingly
=======

import TopicBox from './TopicBox'; // Passe den Pfad entsprechend an
import { mapState } from 'vuex';




>>>>>>> 5d458ad752d31a9e997ab7889bceed4fad72bc1c

export default {
  components: {
    TopicBox,
  },
  computed: {
    ...mapState({
      topics: state => state.topics
    })
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
