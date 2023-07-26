
// CommentReply.vue
<template>

  
  <div class="comment-reply">
    <!-- Antwort-Informationen anzeigen -->
    <div class="profile-info">
      <img :src="reply?.author?.profileImage" alt="Profilbild" class="profile-image" />
      <span class="profile-name">{{ reply?.author?.name }}</span>
      
<!-- Aufklapp-Button für Antworten -->


</div>
<p class="antwort-text">{{ reply?.text }}</p>
    <!-- Antwort-Formular anzeigen, wenn auf diese Antwort geantwortet werden soll -->
   




    <div class="buttons-container">

      
      <!-- "Mehr anzeigen" Link anzeigen, wenn die Verschachtelungstiefe genau 3 ist -->


      <!-- Antwort-Button anzeigen, um auf diese Antwort zu antworten -->
      <button v-if="!showReplyForm && depth < 3" @click="showReplyForm = true" class="reply-button">
        <font-awesome-icon :icon="['fas', 'commenting']" />
      </button>

<!-- Upvote Button -->
<button @click="upvoteComment" class="action-button">
  <font-awesome-icon :icon="['fas', 'thumbs-up']" class="icon" />
  <p>{{ upvotesCount }}</p>
</button>

<!-- Downvote Button -->
<button @click="downvoteComment" class="action-button">
  <font-awesome-icon :icon="['fas', 'thumbs-down']" class="icon" />
  <p>{{ downvotesCount }}</p>
</button>

<!-- {{ replyCount+ ' Antworten' }} -->

<button v-if="!showReplyForm && reply.replies && reply.replies.length > 0" @click="expandReplies = !expandReplies" :class="[ 'action-button', depth >= 3 ? 'disabled' : '']">
  <font-awesome-icon v-if="!expandReplies" :icon="['fas', 'angle-down']" />
  <font-awesome-icon v-else :icon="['fas', 'angle-up']" />
  {{ replyCount+ ' Antworten' }}
  <!-- Hier wird die Anzahl der Antworten angezeigt -->
</button>

<!--Aufklapp Button-->
<router-link v-if="reply && depth === 3" :to="`/comment/${reply.id}`" class="more-link">
        Mehr Anzeigen..
      </router-link>
</div>




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
    <div v-if="showReplyForm" class="reply-form">
      <textarea v-model="newReply" placeholder="Schreibe eine Antwort..." class="reply-textarea"></textarea>
      <div class="reply-actions">
        <button @click="cancelReply" class="cancel-reply-button">Abbrechen</button>
        <button @click="submitReply" class="submit-reply-button">Antworten</button>
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
    upvotesCount() {
    return this.reply.votes ? Object.values(this.reply.votes).filter(vote => vote === 1).length : 0;
  },
  downvotesCount() {
    return this.reply.votes ? Object.values(this.reply.votes).filter(vote => vote === -1).length : 0;
  },



  },
  methods: {


    upvoteComment() {
    this.$store.dispatch('upvoteComment', { commentId: this.reply.id });
  },
  downvoteComment() {
    this.$store.dispatch('downvoteComment', { commentId: this.reply.id });
  },

    ...mapActions(['addReplyToComment']),
    // Funktion zum Einreichen einer Antwort auf diese Antwort
  submitReply() {
  const newReply = {
    id: uuidv4(),
    text: this.newReply,
    author: this.getUserProfile, // immer Benutzer 'Dejan Pantos'
    replies: [], 
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

  border-left: 1px solid #ccc;
  padding-left: 10px;

  .profile-info {
    display: flex;
    align-items: flex-start;
   

    .profile-image {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px;
    }

    .profile-name {
      color: #000000;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .comment-text {
  color: #1c1c1c;
  font-size: 14px;
  text-align: left; 
/* Fügt linksbündigen Text hinzu */
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
    background-color: #ffffff; /* Fügen Sie einen Hintergrund hinzu */
    border-radius: 5px; /* Runden Sie die Ecken ein wenig ab */
  }

  .reply-button {
    display: flex;
    margin-top: 15px;
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
  .buttons-container {
  display: flex;
  gap: 18px;
  
}
.action-button {
  background: none;
  border: none;
  color: #787878;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
 
}

.action-button:hover {
  color: #0079d3;
}

.icon {
  font-size: 1em;
}

.right-aligned-button {
  margin-left: auto;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}


}
</style>