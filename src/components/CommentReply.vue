<template>
    <div class="comment-reply">
      <!-- Antwort-Informationen anzeigen -->
      <div class="profile-info">
        <img :src="reply?.author?.profileImage" alt="Profilbild" class="profile-image" />
        <span class="profile-name">{{ reply?.author?.name }}</span>
        <p class="comment-text">{{ reply?.text }}</p>
      </div>
  
      <!-- Antwort-Button anzeigen, um auf diese Antwort zu antworten -->
      <button v-if="!showReplyForm" @click="showReplyForm = true" class="reply-button">
        Antworten
      </button>
  
      <!-- Antwort-Formular anzeigen, wenn auf diese Antwort geantwortet werden soll -->
      <div v-if="showReplyForm" class="reply-form">
        <textarea v-model="newReply" placeholder="Schreibe eine Antwort..." class="reply-textarea"></textarea>
        <div class="reply-actions">
          <button @click="cancelReply" class="cancel-reply-button">Abbrechen</button>
          <button @click="submitReply" class="submit-reply-button">Antworten</button>
        </div>
      </div>
  
      <!-- Anzeige der Antworten auf diese Antwort -->
      <div v-if="reply.replies && reply.replies.length > 0" class="replies-section">
        <div v-for="nestedReply in reply.replies" :key="nestedReply.id" class="nested-reply">
          <comment-reply :reply="nestedReply"></comment-reply>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { v4 as uuidv4 } from 'uuid';
  import { mapGetters, mapActions } from 'vuex';
  
  export default {
    props: {
      reply: {
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
      // Funktion zum Einreichen einer Antwort auf diese Antwort
      submitReply() {
        const newReply = {
          id: uuidv4(),
          text: this.newReply,
          author: this.getUserProfile,
          replies: [], // Neue Antwort hat keine weiteren Antworten
        };
  
        // Fügt die neue Antwort zu den Antworten dieser Antwort hinzu
        if (!this.reply.replies) {
          this.reply.replies = [];
        }
        this.reply.replies.push(newReply);
  
        // Setzt das Antwort-Formular zurück
        this.newReply = "";
        this.showReplyForm = false;
      },
  
      // Funktion zum Abbrechen der Antwort auf diese Antwort
      cancelReply() {
        this.newReply = "";
        this.showReplyForm = false;
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .comment-reply {
    margin-left: 20px; /* Einrückung für Antworten */
    border-left: 2px solid #ccc; /* Linie zur Unterscheidung der Antworten */
    padding-left: 10px; /* Einen kleinen Abstand zwischen Linie und Text */
    margin-bottom: 10px; /* Abstand zwischen Antworten */
  }
  
  /* Antwort-Button-Stile */
  .reply-button {
    margin-top: 5px; /* Ein kleiner Abstand über dem Button */
  }
  
  /* Antwort-Formular-Stile */
  .reply-form {
    margin-top: 10px; /* Ein Abstand über dem Formular */
  }
  
  /* Antworten auf Antworten */
  .nested-reply {
    margin-left: 20px; /* Einrückung für Antworten auf Antworten */
  }
  </style>