// TopicComponentGanzeSeite.vue
<template>
  <div class="header"> <button class="zurück-button" @click="$router.go(-1)"> <font-awesome-icon
        :icon="['fas', 'arrow-left']" size="lg" /></button>
    <div class="tab-selection">

      <button @click="updateTabAndColor('pro')" :class="{ 'active-tab': selectedTab === 'pro' }">Pro</button>
      <button @click="updateTabAndColor('contra')" :class="{ 'active-tab': selectedTab === 'contra' }">Contra</button>
    </div>


  </div>

  <div class="topic-container">
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-ganzeseite">
      <div class="author-info">
        <img :src="author.profileImage" alt="Author Profile Image" class="author-image" />
        <span class="author-name">{{ author.name }}</span>
      </div>
      <div class="topic-content" @click="goToTopic">
        <p class="topic-text">{{ topic.text }}</p>
      </div>
    </div>
    <div class="trenn-line">

    </div>


    <div v-if="selectedTab === 'pro'" class="kommentare">
      <CommentBox v-for="comment in sortedProComments.slice(0, displayedCommentCount)" :key="comment.id"
        :comment="comment" :topic="comment.topicId" />
      <button v-if="displayedCommentCount < sortedProComments.length" @click="showMoreComments">Mehr anzeigen</button>
    </div>

    <div v-else-if="selectedTab === 'contra'" class="kommentare">
      <CommentBox v-for="comment in sortedContraComments.slice(0, displayedCommentCount)" :key="comment.id"
        :comment="comment" :topic="comment.topicId" />
      <button v-if="displayedCommentCount < sortedContraComments.length" @click="showMoreComments">Mehr anzeigen</button>
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
    const route = useRoute();
    const store = useStore();
    const users = computed(() => store.state.users)
    const topics = store.state.topics
    const topicId = computed(() => props.id);
    const commentId = props.commentId; // Kommentar-ID aus den Props extrahieren
    const replyId = props.replyId; // Antwort-ID aus den Props extrahieren
    const topic = computed(() => store.getters.getTopicById(topicId.value));
    const author = computed(() => store.getters.getUserById(topic.value.author))
    const comment = topic.value.proComments.find(comment => comment.id === commentId);
    /*eslint-enable*/
    const sortedProComments = computed(() => sortCommentsWithIndex(topic.value.proComments));
    const sortedContraComments = computed(() => sortCommentsWithIndex(topic.value.contraComments));

    const selectedTab = computed(() => store.state.selectedTab);
    const displayedCommentCount = computed(() => store.state.displayedCommentCount);
    const lastScrollPosition = ref(0);
    const isTabBarSticky = ref(false);
    const isScrolled = ref(false);

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset -100 || document.documentElement.scrollTop;

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
          }, 1500);
        }

        window.addEventListener('scroll', handleScroll); // Wenn erforderlich
      }
    });

    function sortCommentsWithIndex(comments) {
      // Zuerst sortieren wir alle Kommentare nach der Summe von Upvotes und Downvotes
      const sortedByVotes = [...comments].sort((a, b) => {
        const votesA = a.upvotes + a.downvotes;
        const votesB = b.upvotes + b.downvotes;
        return votesB - votesA;
      });

      // Wir nehmen die ersten 3 Kommentare
      const topComments = sortedByVotes.slice(0, 3);

      // Den Rest der Kommentare sortieren wir nach dem Erstellungsdatum
      const sortedByDate = sortedByVotes.slice(3).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Schließlich kombinieren wir die beiden Arrays
      const sortedComments = [...topComments, ...sortedByDate];

      // Füge den Index als commentIndex zu jedem Kommentar hinzu
      sortedComments.forEach((comment, index) => {
        comment.commentIndex = index;
      });

      return sortedComments;
    }

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
      author,
      topics,
      users,
      sortedContraComments,
      sortedProComments,


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




    async addComment(commentText) {
      const author = this.user;
      const topicId = this.topic.id;
      const currentUserId = this.$store.state.currentUser.id;
      try {
        // Zuerst das Thema abrufen
        await this.$store.dispatch('fetchTopic', topicId);

        const newComment = {
          topicId: topicId,
          id: uuidv4(),
          text: commentText,
          author: this.user.id,
          upvotes: 0,
          downvotes: 0,
          createdAt: dayjs(), // Aktuelle Zeit hinzufügen
          parentId: this.topic.id,
          depth: 0,
          expandReplies: false,
          replies: [],
          showelement: true,

          // Pfad zum Kommentar hinzufügen
        };

        const selectedTab = this.selectedTab; // Richtiges Property verwenden

        // Den Kommentar an die API senden
        if (selectedTab == "pro") {
          newComment.commentIndex = this.topic.proComments.length
          newComment.commentType = "pro"
        }
        else {
          newComment.commentIndex = this.topic.contraComments.length
          newComment.commentType = "contra"
        }

        // Kommentar zum Store hinzufügen
        console.log(this.author.id + " component")

        this.$store.dispatch('addCommentToTopic', { author, topicId, comment: newComment, selectedTab, notificationType: "commentaddtotopic", zielId: this.author.id, benachrichtigungsElementId: newComment.id, userId: currentUserId })
          .then(() => {
            // Warten Sie, bis der Kommentar hinzugefügt wurde, und scrollen Sie dann zu ihm
            this.$nextTick(() => {
              const element = document.getElementById(newComment.id);
              if (element) {
                const yCoordinate = element.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top: yCoordinate, behavior: 'smooth' });
                element.classList.add('highlighted'); // Hinzufügen der 'highlighted' Klasse
                setTimeout(() => {
                  element.classList.remove('highlighted');
                }, 1000);
              }
            });
          })

      }

      catch (error) {
        console.error('Fehler beim Hinzufügen des Kommentars:', error);
        // Hier können Sie eine Fehlermeldung anzeigen oder andere Maßnahmen ergreifen, um mit dem Fehler umzugehen
      }
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

  },


};
</script>


<style lang="scss" scoped>
p.topic-text {
  font-size: 16px;
  line-height: 1.2;
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
  padding-top: 40px;
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

button.zurück-button {
  position: fixed;
  z-index: 1000;
  left: 10px;
  top: 10px;
  background-color: transparent;
  border: none;
  padding: 0px;
}

.tab-selection {
  display: flex;
  justify-content: space-evenly;
  position: fixed;
  background-color: white;
  min-width: 100%;


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
  box-shadow: 0 0 15px rgba(80, 79, 79, 0.7);
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

.trenn-line {
  width: 100%;
  border-bottom: 1px solid lightgrey;
}
</style>