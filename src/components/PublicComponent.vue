<template>
  <div>
    <!-- Schleife über die Daten und erzeuge die TopicBox-Komponenten für jedes Thema -->
    <TopicBox
      v-for="topic in topics"
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
    })
  },
};
</script>