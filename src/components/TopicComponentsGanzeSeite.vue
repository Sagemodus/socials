// TopicComponentGanzeSeite.vue
<template>
  <div class="sticky-tab-bar" :class="{ 'sticky': isTabBarSticky, 'scrolled': isScrolled }">
    <div class="tab-selection">
      <button @click="updateTabAndColor('pro')" :class="{ 'active-tab': selectedTab === 'pro' }">Pro</button>
      <button @click="updateTabAndColor('contra')" :class="{ 'active-tab': selectedTab === 'contra' }">Contra</button>
    </div>
  </div>
  <button @click="scrollToElement">Fokus auf Kommentar setzen</button>
  <div class="topic-container">
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-ganzeseite">
      <div class="author-info">
        <img :src="topic.author.profileImage" alt="Author Profile Image" class="author-image" />
        <span class="author-name">{{ topic.author.name }}</span>
      </div>
      <div class="topic-content" @click="goToTopic">
        <p class="topic-text">{{ topic.text }}</p>
      </div>
    </div>



    <div v-if="selectedTab === 'pro'" class="kommentare">
      <CommentBox v-for="comment in topic.proComments.slice(0, displayedCommentCount)" :key="comment.id"
        :comment="comment" :topic="comment.topicId" />
      <button v-if="displayedCommentCount < topic.proComments.length" @click="showMoreComments">Mehr anzeigen</button>
    </div>

    <div v-else-if="selectedTab === 'contra'" class="kommentare">
      <CommentBox v-for="comment in topic.contraComments.slice(0, displayedCommentCount)" :key="comment.id"
        :comment="comment" :topic="comment.topicId" />
      <button v-if="displayedCommentCount < topic.contraComments.length" @click="showMoreComments">Mehr anzeigen</button>
    </div>
    <!-- Anzeige, wenn keine Kommentare vorhanden sind -->
    <div v-else>
      <p>Noch keine Kommentare vorhanden.</p>
    </div>


    <!-- An zeige, wenn das Thema geladen wird -->

  </div>

  <div class="add-comment-container">
    <AddComment @add-comment="addComment" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import CommentBox from './CommentBox';
import AddComment from '../components/addComment.vue';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from 'vuex';
import { computed, watchEffect } from 'vue';
import { ref, onMounted, onBeforeUnmount, } from 'vue';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { onUnmounted } from 'vue';

export default {
  props: ['id', 'commentId', 'replyId'], // Empfange die Parameter als Props

/*eslint-disable*/
  setup(props) {
    /* eslint-disable no-unused-vars */
    const route = useRoute()
    const store = useStore();
    const topicId = computed(() => props.id);
    const commentId = props.commentId; // Kommentar-ID aus den Props extrahieren
    const replyId = props.replyId; // Antwort-ID aus den Props extrahieren
    const topic = computed(() => store.getters.getTopicById(topicId.value));
    const comment = topic.value.proComments.find(comment => comment.id === commentId);
/*eslint-enable*/

    // ... andere setup-Abschnitte ...

    const selectedTab = computed(() => store.state.selectedTab);
    const displayedCommentCount = computed(() => store.state.displayedCommentCount);
    const lastScrollPosition = ref(0);
    const isTabBarSticky = ref(false);
    const isScrolled = ref(false);

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      // Überprüfe die Scroll-Richtung und aktualisiere isTabBarSticky
      isTabBarSticky.value = scrollPosition < lastScrollPosition.value;

      // Aktualisiere isScrolled basierend auf scrollPosition
      isScrolled.value = scrollPosition > 0;

      // Aktualisiere die letzte Scroll-Position
      lastScrollPosition.value = scrollPosition;
    };






    // Reagiere auf Route-Änderungen und extrahiere die Kommentar-ID aus der URL
    onMounted(() => {

      if (replyId) {

        if (selectedTab.value === "pro") {
          const comment = topic.value.proComments.find(comment => comment.id === commentId);
          if (comment) {

            comment.expandReplies = true;

          }
        } else {
          const comment = topic.value.contraComments.find(comment => comment.id === commentId);
          if (comment) {
            comment.expandReplies = true;
          }
        } setTimeout(() => {

          const replyElement = document.getElementById(replyId);
          if (replyElement) {
            setTimeout(() => {
              replyElement.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }
        }, 50);
      } else {
        const commentElement = document.getElementById(commentId);

        if (commentElement) {
          setTimeout(() => {
            console.log(commentElement + " wird gescrollt")
            commentElement.scrollIntoView({ behavior: "smooth" });
          }, 50);

          commentElement.classList.add('highlighted');

          setTimeout(() => {
            commentElement.classList.remove('highlighted');
          }, 2500);
        }

        window.addEventListener('scroll', handleScroll); // Wenn erforderlich
      }
    });



    onBeforeUnmount(() => {
      store.commit('resetDisplayedCommentCount');


    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll); // Wenn erforderlich
    });
    const selectedTabColor = computed(() => store.state.selectedTabColor);


    watchEffect(() => {
      document.documentElement.style.setProperty('--selectedTabColor', selectedTabColor.value);
    });

    return {
      // ... andere zurückgegebene Werte ...
      selectedTab,
      displayedCommentCount,
      isTabBarSticky,
      isScrolled,
      store,
      topic,



    };
  },
  components: {
    CommentBox,
    AddComment,
  },
  computed: {
    ...mapGetters(['getTopicById', 'getUserProfile']),

    ...mapGetters(['getTopicById']),




    user() {
      return this.$store.state.currentUser;
    },



  },

  methods: {
    ...mapActions(['fetchComments', 'addCommentToTopic', 'selectTab']),

    scrollToElement() {
      // Das Element mit der commentId finden
      const commentElement = document.getElementById(this.commentId);

      // Überprüfen, ob das Element existiert
      if (commentElement) {
        // Scrollen zum Element mit sanftem Verhalten
        commentElement.scrollIntoView({ behavior: "smooth" });
        console.log(commentElement + "2")
      }
    },

    // Hilfsfunktion, um den Kommentar mit der neuen ID zu finden
    findCommentById(newCommentId) {
      // Durchsuche die Kommentarliste nach dem Kommentar mit der neuen ID
      const allComments = [...this.topic.proComments, ...this.topic.contraComments];
      return allComments.find(comment => comment.id === newCommentId);
    },



    updateTabAndColor(tab) {

      this.$store.dispatch('selectTab', tab); // Action aufrufen
      this.$store.dispatch('updateSelectedTabColor'); // Action aufrufen
    },


    showMoreComments() {
      this.$store.commit('incrementDisplayedCommentCount', 20); // Adjust the increment value as needed
    },




    addComment(commentText) {
      const topicId = this.topic.id;
      const newComment = {
        topicId: topicId,
        id: uuidv4(),
        text: commentText,
        author: this.user,
        upvotes: 0,
        downvotes: 0,
        createdAt: dayjs(), // Aktuelle Zeit hinzufügen
         // Pfad zum Kommentar hinzufügen
      };


      const selectedTab = this.selectedTab; // Richtiges Property verwenden
      this.$store.dispatch('addCommentToTopic', { topicId, comment: newComment, selectedTab });
    },
  },

  goToCommentPage(commentId) {
    const comment = this.$store.getters.getCommentById(commentId);
    // Führt Sie zur Kommentarseite, wenn es ausreichend Antworten gibt
    if (comment && comment.replies && comment.replies.length >= 3) {
      this.$router.push(`/comment/${commentId}`);
    } else {
      const replies = comment.replies;
      if (replies && replies.length > 0) {
        for (const reply of replies) {
          if (reply.replies && reply.replies.length >= 3) {
            this.$router.push({
              path: `/comment/${commentId}`,
              query: { maxDisplayedReplies: this.maxDisplayedReplies },
            });
            return;
          }
        }
      }
    }
  },

  created() {
    this.fetchComments();
  },
};
</script>


<style lang="scss" scoped>
p.topic-text {
  font-size: 16px;
  line-height: 1.5;
  text-align: justify;
  padding: 10px;
  padding-top: 0px;
  margin-top: 0;
  margin-bottom: 0;
}

.topic-container {
  margin-bottom: 120px;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 10px;
}


.author-info {
  display: flex;
  align-items: center;

}

.author-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.author-name {
  font-weight: bold;
}

.topic-content {
  margin-top: 10px;
}



.topic-text {
  font-size: 16px;
  line-height: 1.5;
}

.tab-selection {
  display: flex;
  justify-content: space-evenly;
  background-color: white;


  button {
    padding: 10px 20px;
    font-size: 16px;
    color: #333;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: transparent;
      transition: background-color 0.3s ease;
    }





    &.active-tab {
      color: var(--selectedTabColor);
      font-weight: bold;

      &:before {
        background-color: var(--selectedTabColor);
      }
    }
  }
}

.highlighted {
  box-shadow: 0 0 5px rgba(144, 144, 144, 0.7);
  /* Leichter grauer Schatten für Hervorhebung */
  transition: box-shadow 0.3s ease-in-out;
  /* Schattenübergangseffekt */
  border-radius: 5px;
  /* Abgerundete Ecken für ein weicheres Aussehen */
}

.highlighted:hover {
  animation: pulse 1s infinite alternate;
  /* Schattenanimation bei Hover */
  transform: scale(1.02);
  /* Leichtes Vergrößern bei Hover */
}

@keyframes pulse {
  to {
    box-shadow: 0 0 10px rgba(144, 144, 144, 0.7);
    /* Größerer grauer Schatten bei Animation */
  }
}
</style>