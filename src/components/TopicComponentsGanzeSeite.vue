// TopicComponentGanzeSeite.vue
<template>
  <div>
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-details">
      <img :src="topic.image" alt="Topic image" class="topic-image" />
      <h2 class="topic-title">{{ topic.title }}</h2>
      <p class="topic-text">{{ topic.text }}</p>

      <!-- Hinzufügen von Kommentaren -->
      <AddComment @add-comment="addComment" />

      <!-- Anzeige von Kommentaren -->
      <div v-if="topic.comments.length > 0">
      <CommentBox
        v-for="comment in topic.comments"
        :key="comment.id"
        :comment="comment"
        @reply-clicked="goToCommentPage"
        @add-reply="addReplyToComment(comment, $event)"
      />
    </div>

      <!-- Anzeige, wenn keine Kommentare vorhanden sind -->
      <div v-else>
        <p>Noch keine Kommentare vorhanden.</p>
      </div>
    </div>

    <!-- Anzeige, wenn das Thema geladen wird -->
    <div v-else>
      <p>Loading topic...</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import CommentBox from './CommentBox';
import AddComment from '../components/addComment.vue';
import { v4 as uuidv4 } from 'uuid';

export default {
  components: {
    CommentBox,
    AddComment,
  },
  computed: {
    ...mapGetters(['getTopicById', 'getAllComments','getUserProfile']),
   
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
  },
  
  methods: {
    ...mapActions(['fetchComments', 'addCommentToTopic', 'addReplyToComment']),
    addComment(commentText) {
      const newComment = {
        id: uuidv4(),
        text: commentText,
        author: this.getUserProfile,
      };
      this.$store.dispatch('addCommentToTopic', { topicId: this.topic.id, comment: newComment });
    },

    addReplyToComment(comment, replyText) {
      const newReply = {
        id: uuidv4(),
        text: replyText,
        author: this.getUserProfile,
      };
      this.addReplyToComment({ commentId: comment.id, reply: newReply });
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
  },
  created() {
    this.fetchComments();
  },
};
</script>


<style scoped>
.topic-details {
  text-align: center; /* Zentriert den gesamten Inhalt in der Mitte */
}
img.topic-image {
    min-width: 83%;
}

.topic-text {
  text-align: justify;
max-width: 83%;
  margin: 0 auto; /* Zentriert den Text horizontal */
  margin-bottom: 1.5em;
}
</style>