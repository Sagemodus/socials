
//PublicComponent.vue
<template>
  <div>
    <!-- Schleife über die Daten und erzeuge die TopicBox-Komponenten für jedes Thema -->
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
import TopicBox from './TopicBox'; // Passe den Pfad entsprechend an
import { mapState } from 'vuex';
import { fetchDataFromDatabase } from '../firebase/dataFetcher';




export default {
  components: {
    TopicBox,
  },
  computed: {
    ...mapState({
      topics: state => state.topics // Dies bringt den topics-State aus dem Store in Ihre Komponente
    })
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