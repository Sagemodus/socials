<template>
  <div class="comment-box">
    <img :src="comment?.author?.profileImage" alt="Profilbild" class="profile-image" />
    <div class="profile-info">
      <span class="profile-name">{{ comment?.author?.name }}</span>
      <p class="comment-text">{{ comment?.text }}</p>

      <!-- Antwort-Button -->
      <button v-if="!showReplyForm" @click="showReplyForm = true" class="reply-button">
        Antworten
      </button>

      <!-- Antwort-Formular -->
      <div v-if="showReplyForm" class="reply-form">
        <textarea v-model="newReply" placeholder="Schreibe eine Antwort..." class="reply-textarea"></textarea>
        <div class="reply-actions">
          <button @click="cancelReply" class="cancel-reply-button">Abbrechen</button>
          <button @click="submitReply" class="submit-reply-button">Antworten</button>
        </div>
      </div>
   <!-- Anzeige der Antworten -->
   <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
      <comment-reply
        v-for="reply in comment.replies"
        :key="reply.id"
        :reply="reply"
      ></comment-reply>
        </div>
      </div>
    </div>
    
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { mapGetters, mapActions } from 'vuex';
import CommentReply from './CommentReply.vue';

export default {
  components: {
    CommentReply, // Registrieren Sie die CommentReply-Komponente, damit Sie sie verwenden können
  },

  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showReplyForm: false,
      newReply: "",
    };
  },
  computed: {
    ...mapGetters(['getUserProfile']),
  },
  methods: {
    ...mapActions(['addReplyToComment']),
    // Funktion zum Einreichen einer Antwort
    submitReply() {
      const reply = {
        id: uuidv4(),
        text: this.newReply,
        author: this.getUserProfile,
      };

      // Fügt die Antwort zu den Kommentar-Replies hinzu
      if (!this.comment.replies) {
        this.comment.replies = [];
      }
      this.comment.replies.push(reply);

      // Setzt das Antwort-Formular zurück
      this.newReply = "";
      this.showReplyForm = false;
    },

    // Funktion zum Abbrechen der Antwort
    cancelReply() {
      this.newReply = "";
      this.showReplyForm = false;
    },
  },
};
</script>
  <style lang="scss" scoped>
  .comment-box {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #e1e4e8;
  
    &:last-child {
      border-bottom: none;
    }
  
    .profile-image {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 10px;
    }
  
    .profile-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: calc(100% - 60px);
  
      .profile-name {
        font-size: 14px;
        font-weight: bold;
        color: #24292e;
      }
  
      .comment-text {
        font-size: 14px;
        color: #586069;
        margin-top: 5px;
      }
    }
  }
  </style>
  