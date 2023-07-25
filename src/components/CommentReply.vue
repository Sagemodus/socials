
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

            <font-awesome-icon v-if="!expandReplies" :icon="['fas', 'plus']" />
    <font-awesome-icon v-else :icon="['fas', 'minus']" />
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
    Antworten({{ replyCount }} Antworten)
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
  margin-top: 10px;
  border-left: 1px solid #ccc;
  padding-left: 10px;

  .profile-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;

    .profile-image {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px;
    }

    .profile-name {
      color: #0079d3;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .comment-text {
      color: #1c1c1c;
      font-size: 14px;
    }
  }
  .more-link {
    display: inline-block;
    margin-top: 10px;
    color: #0079d3;
    font-size: 12px; /* Reduzieren Sie die Schriftgröße */
    font-weight: 400; /* Setzen Sie die Schriftstärke auf Normal */
    text-decoration: none; /* Entfernen Sie die Unterstreichung */
    cursor: pointer;
    padding: 2px 5px; /* Fügen Sie ein wenig Polster hinzu */
    background-color: #f6f7f8; /* Fügen Sie einen Hintergrund hinzu */
    border-radius: 5px; /* Runden Sie die Ecken ein wenig ab */
  }

  .reply-button {
    margin-top: 10px;
    color: #787878;
    background: none;
    border: none;
    cursor: pointer;
  }

  .reply-form {
    margin-top: 10px;

    .reply-textarea {
      width: 100%;
      min-height: 50px;
      resize: vertical;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .reply-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;

      .cancel-reply-button,
      .submit-reply-button {
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #ccc;
      }

      .cancel-reply-button {
        background: #fff;
      }

      .submit-reply-button {
        background: #0079d3;
        color: #fff;
        border-color: #0079d3;
      }
    }
  }

  .replies-section {
    margin-top: 10px;
  }

  .more-link {
    display: inline-block;
    margin-top: 10px;
    color: #0079d3;
    text-decoration: none;
    cursor: pointer;
  }

  .expand-button {
    border: none;
    background: none;
    cursor: pointer;
  }
}
</style>