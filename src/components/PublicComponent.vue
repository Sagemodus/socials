<template>
  <div>
    <!-- Loop through the data and create TopicBox components for each topic -->
    <TopicBox
      v-for="topic in topics"
      :key="topic.id"
      :id="topic.id"
      :image="topic.image"
      :title="topic.title"
      :text="topic.text"
      :likes="topic.likes"
      @topic-click="handleTopicClick"
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
