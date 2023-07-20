<template>
  <div class="app">
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
import TopicBox from '../components/TopicBox.vue';

export default {
  components: {
    TopicBox
  },
  data() {
    return {
      topics: [
        {
          id: 1,
          image: '/pfad/zum/bild1.jpg',
          title: 'Titel 1',
          text: 'Text 1',
          likes: {
            '-4': 5, // Sehr linke Gruppe
            '-3': 30, // Linke Gruppe
            '-2': 20, // Leicht linke Gruppe
            '-1': 10, // Zentrum-Links Gruppe
            '1': 5,   // Zentrum-Rechts Gruppe
            '2': 15,  // Leicht rechte Gruppe
            '3': 25,  // Rechte Gruppe
            '4': 400   // Sehr rechte Gruppe
          }
        },
        {
          id: 2,
          image: '/pfad/zum/bild2.jpg',
          title: 'Titel 2',
          text: 'Text 2',
          likes: {
            '-4': 2000, // Sehr linke Gruppe
            '-3': 10, // Linke Gruppe
            '-2': 15, // Leicht linke Gruppe
            '-1': 30, // Zentrum-Links Gruppe
            '1': 25,  // Zentrum-Rechts Gruppe
            '2': 20,  // Leicht rechte Gruppe
            '3': 10,  // Rechte Gruppe
            '4': 5   // Sehr rechte Gruppe
          }
        },
        // Fügen Sie weitere Themen hinzu, wenn gewünscht
      ]
    };
  }
}
</script>

<style scoped>
.app {
  /* Stilisierung der App */
}
</style>
