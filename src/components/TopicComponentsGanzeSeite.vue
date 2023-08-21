// TopicComponentGanzeSeite.vue
<template>
  <div>
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-ganzeseite">
      <div class="author-info">
        <img :src="topic.createdBy.profileImage" alt="Author Profile Image" class="author-image" />
        <span class="author-name">{{ topic.createdBy.name }}</span>
      </div>
      <div class="topic-content" @click="goToTopic">
        <p class="topic-text">{{ topic.text }}</p>
      </div>

      <!-- Hinzufügen von Kommentaren -->
      <AddComment @add-comment="addComment" />

      <!-- Anzeige von Kommentaren -->
      <div v-if="topic.comments.length > 0" class="kommentare">
        <CommentBox
          v-for="comment in topic.comments"
          :key="comment.id"
          :comment="comment"
          @reply-clicked="goToCommentPage"
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
.topic-ganzeseite {
  max-width: 100%; /* Beispielwert für die maximale Breite */
  margin: 0 auto; 
  background-color: #ffffff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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
  margin-top: 20px;
}



.topic-text {
  font-size: 16px;
  line-height: 1.5;
}

</style>