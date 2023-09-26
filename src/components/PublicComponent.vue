<template>
  <div>
    <button @click="szene2"></button>
    <!-- Loop through the data and create TopicBox components for each topic -->
    <TopicBox v-for="topic in sortedTopics.slice()" :key="topic.id" :id="topic.id" />
  </div>
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex';
import TopicBox from './TopicBox'; // Make sure to adjust the path accordingly
import axios from "axios";
import { useStore } from 'vuex';
import { computed } from 'vue';
import { ref, onMounted } from "vue";

export default {

  setup() {
    const store = useStore();
    const topics = store.state.topics;
    const users = store.state.topics;
    // Laden Sie die Daten beim Komponentenstart





    const szene2= () => {
      const users = store.state.users; // Holen Sie die Liste der Topics
      console.log(users)
      // Iterieren Sie durch jedes Element in der Topic-Liste
      for (let i = 0; i < users.length; i++) {
        const data = users[i]; // Holen Sie das aktuelle Topic-Objekt
        console.log(data)
        addUsersToDatabase(data); // Rufen Sie die Funktion auf, um das Topic in die Datenbank einzufügen
      }
    };

    async function addUsersToDatabase(data) {



      try {

        console.log(data + "amk")
        // Senden Sie das gesamte Topics-Array an Ihre API-Route
        await axios.post("http://localhost:3000/api/addUsers", data);

        console.log("Topics erfolgreich in die Datenbank gespeichert");
      } catch (error) {
        console.error("Fehler beim Speichern der Topics in die Datenbank:", error);
        // Hier können Sie geeignete Fehlermeldungen oder Aktionen hinzufügen
      }
    }








   

    const szene = () => {
      const topicList = topics.value; // Holen Sie die Liste der Topics
console.log(topicList)
      // Iterieren Sie durch jedes Element in der Topic-Liste
      for (let i = 0; i < topicList.length; i++) {
        const topicData = topicList[i]; // Holen Sie das aktuelle Topic-Objekt
        console.log(topicData)
        addTopicsToDatabase(topicData); // Rufen Sie die Funktion auf, um das Topic in die Datenbank einzufügen
      }
    };
   


    async function addTopicsToDatabase(topicData) {



      try {

        console.log(topicData + "amk")
        // Senden Sie das gesamte Topics-Array an Ihre API-Route
        await axios.post("http://localhost:3000/api/addTopics", topicData);

        console.log("Topics erfolgreich in die Datenbank gespeichert");
      } catch (error) {
        console.error("Fehler beim Speichern der Topics in die Datenbank:", error);
        // Hier können Sie geeignete Fehlermeldungen oder Aktionen hinzufügen
      }
    }


    return {
      addTopicsToDatabase,
      topics,
      szene,
      szene2
    }
  },



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
