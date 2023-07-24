
// CommentReply.vue
<template>
  <div class="comment-reply">
    <!-- Antwort-Informationen anzeigen -->
    <div class="profile-info">
      <img :src="reply?.author?.profileImage" alt="Profilbild" class="profile-image" />
      <span class="profile-name">{{ reply?.author?.name }}</span>
      <p class="comment-text">{{ reply?.text }}</p>
    </div>

    <!-- Antwort-Button anzeigen, um auf diese Antwort zu antworten -->
    <button v-if="!showReplyForm && depth < 3" @click="showReplyForm = true" class="reply-button">
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

          <!-- Aufklapp-Button für Antworten -->
          <button v-if="!showReplyForm && reply.replies && reply.replies.length > 0" @click="expandReplies = !expandReplies" class="expand-button">

      <img v-if="!expandReplies" src="/pfad/zum/plus-icon.svg" alt="Plus Icon">
      <img v-else src="/pfad/zum/minus-icon.svg" alt="Minus Icon">
    </button>

    <!-- Anzeige der Antworten auf diese Antwort -->
    <div v-if="expandReplies && reply.replies && reply.replies.length > 0" class="replies-section">
      <comment-reply
        v-for="nestedReply in reply.replies"
        :key="nestedReply.id"
        :reply="nestedReply"
        :depth="depth + 1"
        @reply-clicked="$emit('reply-clicked', $event)"
      ></comment-reply>
    </div>

    <!-- "Mehr anzeigen" Link anzeigen, wenn die Verschachtelungstiefe genau 3 ist -->
    <router-link v-if="reply && depth === 3" :to="`/comment/${reply.id}`" class="more-link">
      Hier Antworten ({{ replyCount }} Antworten)
    </router-link>
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
    depth: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      showReplyForm: false,
    newReply: "",
    expandReplies: false,
    };
  },
  computed: {
    ...mapGetters(['getUserProfile']),
    ...mapGetters(['getCommentById']),
    replyCount() {
    return this.reply.replies ? this.reply.replies.length : 0;
  },
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

      // Wenn die Verschachtelungstiefe 3 erreicht, leite den Benutzer zur gewünschten Seite weiter
      if (this.depth >= 3) {
        this.$emit('reply-clicked', this.reply.id);
      }
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

/* Profilbild, Profilname und Kommentartext */
.profile-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.profile-name {
  font-size: 12px;
  font-weight: bold;
}

.comment-text {
  font-size: 14px;
  margin-top: 5px;
}

/* Antwort-Formular-Textarea */
.reply-textarea {
  width: 100%;
  height: 60px;
  resize: none;
  border: 1px solid #d7dadc;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
}

/* Antwort-Formular-Aktionen */
.reply-actions {
  margin-top: 5px;
}

/* Antworten auf Antworten - "Mehr anzeigen" Link */
.more-link {
  color: #0079d3;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  margin-top: 5px;
}
</style>