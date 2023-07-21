TopicComponentGanzeSeite.vue

<template>
  <div>
    <!-- Topic Details und Kommentare -->
    <div v-if="topic" class="topic-details">
      <img :src="topic.image" alt="Topic image" class="topic-image" />
      <h2 class="topic-title">{{ topic.title }}</h2>
      <p class="topic-text">{{ topic.text }}</p>
      <!-- Topic Likes und Like Button -->
      <!-- ... -->
   <!-- Formular zum Hinzufügen eines Kommentars -->
   <AddComment @add-comment="addComment" />
      <!-- Anzeige der Kommentare -->
      <div v-if="topic.comments.length > 0">
        <CommentBox
          v-for="comment in topic.comments"
          :key="comment.id"
          :comment="comment"
        />
      </div>
      <div v-else>
        <p>Noch keine Kommentare vorhanden.</p>
      </div>
    </div>

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
    ...mapGetters(['getTopicById', 'getAllComments']),
    topic() {
      console.log(typeof this.$route.params.id);

      const topid = parseInt(this.$route.params.id);
      
      return this.getTopicById(topid); // Setze hier den ID-Wert deines gewünschten Topics ein
    },
    comments() {
      return this.getAllComments;
    },
    user() {
      return this.$store.state.user; // Zugriff auf den Benutzer im Zustand
    },
  },
  methods: {
    ...mapActions(['fetchComments', 'addCommentToTopic', 'addReplyToComment']),
    addComment(commentText) {
      const newComment = {
        id: uuidv4(),
        text: commentText,
        author: this.user,
      };
      this.$store.dispatch('addCommentToTopic', { topicId: this.topic.id, comment: newComment });  // Und hier ändern
    },
    
},
watch: {
    
  },

  created() {
    // Rufe die Kommentare beim Laden der Seite ab
    this.fetchComments();
  },
};
</script>

<style lang="scss" scoped>
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: #f6f8fa;
}

.topic-details {
  background-color: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);

  .topic-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 10px;
  }

  .topic-title {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 20px;
    color: #24292e;
  }

  .topic-text {
    margin-top: 10px;
    color: #586069;
  }

  .like-bar {
    display: flex;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 20px;

    .section {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;

      .popup {
        position: absolute;
        top: -30px;
        background-color: white;
        padding: 5px;
        border-radius: 5px;
        font-size: 0.8em;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
      }
    }
  }

  button {
    display: inline-block;
    background-color: #1da1f2;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    margin-top: 20px;
    border: none;
    transition: background-color 0.3s;
    font-size: 0.9em;
    text-transform: capitalize;
    font-weight: bold;

    &:hover {
      background-color: #0c85d0;
    }
  }
}

.comments-section {
  margin-top: 20px;

  .no-comments {
    color: #586069;
    text-align: center;
  }
}
</style>