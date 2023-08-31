// TopicComponentGanzeSeite.vue
<template>
        <div class="sticky-tab-bar" :class="{ 'sticky': isTabBarSticky, 'scrolled': isScrolled }">
      <div class="tab-selection">
        <button @click="updateTabAndColor('pro')" :class="{ 'active-tab': selectedTab === 'pro' }">Pro</button>
        <button @click="updateTabAndColor('contra')" :class="{ 'active-tab': selectedTab === 'contra' }">Contra</button> 
      </div>
    </div>
 <div class="topic-container">
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-ganzeseite">
      <div class="author-info">
        <img :src="topic.createdBy.profileImage" alt="Author Profile Image" class="author-image" />
        <span class="author-name">{{ topic.createdBy.name }}</span>
      </div>
      <div class="topic-content" @click="goToTopic">
        <p class="topic-text">{{ topic.text }}</p>
      </div>
    </div>

      
      <!-- Hinzufügen von Kommentaren -->
  
      

      <!-- Anzeige von Kommentaren -->
     
      <div v-if="selectedTab === 'pro'" class="kommentare">
    <CommentBox
      v-for="comment in displayedProComments"
      :key="comment.id"
      :comment="comment"
      :topic ="topic.id"
    />
    <button v-if="displayedCommentCount < sortedProCommentsByTopic.length" @click="showMoreComments">Mehr anzeigen</button>
  </div>

  <div v-else-if="selectedTab === 'contra'" class="kommentare">
    <CommentBox
      v-for="comment in displayedContraComments"
      :key="comment.id"
      :comment="comment"
      :topic ="topic.id"
    />
    <button v-if="displayedCommentCount < sortedContraCommentsByTopic.length" @click="showMoreComments">Mehr anzeigen</button>
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
import { computed,  watchEffect} from 'vue';
import { ref, onMounted, onBeforeUnmount, } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
  const store = useStore();

  // ... andere setup-Abschnitte ...

  const selectedTab = computed(() => store.state.selectedTab);
  const displayedCommentCount = ref(4);
  
  const lastScrollPosition = ref(0);
    const isTabBarSticky = ref(false);
    const isScrolled = ref(false);
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      isTabBarSticky.value = scrollPosition < lastScrollPosition.value; // Überprüfe die Scroll-Richtung
      lastScrollPosition.value = scrollPosition; // Aktualisiere die letzte Scroll-Position
      isScrolled.value = scrollPosition > 0; // Neu hinzugefügt
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
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
  };
},
  components: {
    CommentBox,
    AddComment,
  },
  computed: {
    ...mapGetters(['getTopicById', 'getAllComments','getUserProfile']),
   
    displayedProComments() {
      return this.sortedProCommentsByTopic.slice(0, this.displayedCommentCount);
    },
    displayedContraComments() {
      return this.sortedContraCommentsByTopic.slice(0, this.displayedCommentCount);
    },


    topic() {
      const topicId = this.$route.params.id;
      return this.getTopicById(topicId); 
    },
    comments() {
      return this.getAllComments;
    },
    user() {
      return this.$store.state.currentUser; 
    },

    sortedProCommentsByTopic() {
      return this.sortedCommentsByTopic('proComments');
    },

    sortedContraCommentsByTopic() {
      return this.sortedCommentsByTopic('contraComments');
    },

  },
  
  methods: {
    ...mapActions(['fetchComments', 'addCommentToTopic', 'selectTab']),
    updateTabAndColor(tab) {
   
      this.$store.dispatch('selectTab', tab); // Action aufrufen
      this.$store.dispatch('updateSelectedTabColor'); // Action aufrufen
    },

    showMoreComments() {
    
      this.displayedCommentCount+= 20; // Adjust the number as needed
    },
  

    sortedCommentsByTopic(commentType) {
  const topicId = this.$route.params.id;
  const topic = this.getTopicById(topicId);
  if (topic) {
    const commentsArray = topic[commentType];
    
    // Sortiere die Kommentare nach den Votes in absteigender Reihenfolge
    const sortedComments = commentsArray.slice().sort((a, b) => b.upvotes - a.upvotes);
    
    // Teile die Kommentare in die ersten 3 und den Rest auf
    const topComments = sortedComments.slice(0, 3);
    const restComments = sortedComments.slice(3);
    
    // Sortiere den Rest der Kommentare nach der Zeit in aufsteigender Reihenfolge
    const sortedRestComments = restComments.sort((b, a) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Füge die ersten 3 Kommentare mit den meisten Votes zuerst hinzu, dann den Rest der sortierten Kommentare
    return [...topComments, ...sortedRestComments];
  }
  return [];
},
addComment(commentText) {
    const topicId = this.topic.id;
    const newComment = {
      topicId: topicId ,
      id: uuidv4(),
      text: commentText,
      author: this.user,
      upvotes: 0, 
      downvotes: 0 ,
      createdAt: dayjs() // Aktuelle Zeit hinzufügen
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

p.topic-text{
    font-size: 16px;
    line-height: 1.5;
    text-align: justify;
    padding: 10px;
    padding-top: 0px;
    margin-top: 0;
    margin-bottom: 0;
}

.topic-container{
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



</style>