<template>
  <div>
    <!-- Schleife über die Daten und erzeuge die TopicBox-Komponenten für jedes Thema -->
    <TopicBox
      v-for="topic in sortedTopics.slice()"
      :key="topic.id"
      :id="topic.id"
    />
  </div>
</template>


<script>

import TopicBox from './TopicBox'; // Passe den Pfad entsprechend an
import { mapState } from 'vuex';





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
      // Hier wird die ID des angeklickten Themas erhalten.
      // Navigiere nun zur TopicComponentGanzeSeite.vue und übergebe die ID als Parameter in der Route.
      this.$router.push({ name: 'TopicDetails', params: { id: topicId } });
    }
  },



  
};

</script>