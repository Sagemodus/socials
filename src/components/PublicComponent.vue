<template>
  <div ref="feedListRef">
  <button
    v-if="showScrollButton"
    @click="scrollToBottom"
    class="back-to-top"
    :style="{ opacity: buttonOpacity }"
  >
    <font-awesome-icon class="arrow" :icon="['fas', 'arrow-up']" size="2xl" />
  </button>
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
import { ref, onMounted, nextTick } from "vue";
import { onBeforeUnmount } from 'vue';

export default {

  setup() {
    const buttonOpacity = ref(1);
    const store = useStore();
    const topics = store.state.topics;
    const users = store.state.topics;
    const feedListRef = ref(null);
     const showScrollButton = ref(false);
    // Laden Sie die Daten beim Komponentenstart
    const scrollToBottom = () => {
      nextTick(() => {
        if (feedListRef.value) {
          window.scrollTo(0, 0);
        }
      });
    };

    const checkScroll = () => {
      // Aktualisieren Sie den Wert von showScrollButton basierend auf der Scroll-Position
      if (feedListRef.value) {
        const containerHeight = feedListRef.value.scrollHeight;
        showScrollButton.value = window.scrollY > containerHeight - 2500;
         buttonOpacity.value = window.scrollY > 200 ? 0.65 : 1;
      }
    };
    onMounted(() => {
      window.addEventListener('scroll', checkScroll);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', checkScroll);
    });


    return {
      topics,
      feedListRef,
      scrollToBottom,  // Hinzugefügt
      showScrollButton,
      buttonOpacity,

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
button.back-to-top {
    position: fixed;
    bottom: 60px;
    right: 20px;
    background-color: var(--iconColor);
    border: none;
    padding :5px 20px 5px 20px;
border-bottom-left-radius: 9999px;
border-bottom-right-radius: 9999px;
border-top-left-radius :9999px;
border-top-right-radius: 9999px;
min-height: 26px;
min-width: 26px;
box-shadow: rgba(217, 217, 217, 0.2) 0px 0px 5px, rgba(217, 217, 217, 0.25) 0px 1px 4px 1px;
}

svg.svg-inline--fa.fa-arrow-up.fa-2xl.arrow {
    color: white;
}

</style>
