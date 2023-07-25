<template>
  <div class="comment-box">
    <div class="comment-content">
      <img :src="comment?.author?.profileImage" alt="Profilbild" class="profile-image" />
      <div class="comment-text-area">
        <p class="username">{{ comment?.author?.name }}</p>
        <p class="comment-text">{{ comment?.text }}</p>
      </div>
    </div>

<!-- Antwort-Button und Expand-Button Container -->
<div class="actions">
  <!-- Antwort-Button -->
  <button v-if="!showReplyForm" @click="showReplyForm = true" class="reply-button action-button">
    <font-awesome-icon :icon="['fas', 'reply']" class="icon" />
   
  </button>

      <!-- Antwort-Formular -->
      <div v-if="showReplyForm" class="reply-form">
        <textarea v-model="newReply" placeholder="Schreibe eine Antwort..." class="reply-textarea"></textarea>
        <div class="reply-actions">
          <button @click="cancelReply" class="cancel-reply-button">Abbrechen</button>
          <button @click="submitReply" class="submit-reply-button">Antworten</button>
        </div>
      </div>

  <!-- Aufklapp-Button für Antworten -->
  <button v-if="!showReplyForm && comment.replies && comment.replies.length > 0" @click="expandReplies = !expandReplies" class="expand-button action-button">
    <font-awesome-icon v-if="!expandReplies" :icon="['fas', 'plus']" />
    <font-awesome-icon v-else :icon="['fas', 'minus']" />
  </button>
</div>
    <!-- Anzeige der Antworten -->
    <div v-if="expandReplies" class="replies-section">
      <comment-reply
        v-for="reply in comment.replies"
        :key="reply.id"
        :reply="reply"
        :depth="1"
        @reply-clicked="onReplyClicked"
      ></comment-reply>
    </div>
  </div>


 
</template>


<script>
import { v4 as uuidv4 } from 'uuid';
import { mapGetters, mapActions } from 'vuex';
import CommentReply from './CommentReply.vue';

export default {
  components: {
    CommentReply,
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
    expandReplies: false,// Max number of replies to display initially
    };
  },
  computed: {
    ...mapGetters(['getUserProfile']),
    visibleReplies() {
      // Return the first 'maxDisplayedReplies' number of replies to display
      return this.comment.replies ? this.comment.replies.slice(0, this.maxDisplayedReplies) : [];
    },
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

      // Wenn die dritte Antwort oder mehr hinzugefügt wird, leite den Benutzer zur gewünschten Seite weiter
   
    },

    // Funktion zum Abbrechen der Antwort
    cancelReply() {
      this.newReply = "";
      this.showReplyForm = false;
    },

    // Diese Methode wird aufgerufen, wenn auf eine Antwort geantwortet wird
    onReplyClicked(reply) {
      // Wenn die Tiefe (depth) 3 oder weniger beträgt, leite den Benutzer zur Seite der einzelnen Antwort weiter
      this.$router.push(`/comment/${reply}`);
    },
  },
};
</script>

<style lang="scss" scoped>




.reply-form {
  margin-top: 10px;
  width: 100%; /* Antwort-Formular über die gesamte Breite */
  display: flex;
  flex-direction: column;
  align-items: center; /* Zentriert das Formular horizontal */

  .reply-textarea {
    width: 100%;
    min-height: 50px;
    margin-bottom: 10px;
    border: none;
    border-radius: 4px;
    padding: 10px;
    resize: vertical;
  }

  .reply-actions {
  display: flex;
  justify-content: center; /* Zentrieren des Inhalts horizontal */
  margin-top: 10px;

  button {
    margin-left: 10px;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }

  .cancel-reply-button {
    background-color: #f8f9fa;
    color: #333;
  }

  .submit-reply-button {
    background-color: #0079d3;
    color: #fff;
  }
}
}




.comment-box {
  padding: 10px;
  border-bottom: 1px solid #e1e4e8;
  font-family: Verdana, Geneva, sans-serif;
  
  &:last-child {
    border-bottom: none;
  }

  .comment-content {
    display: flex;
    align-items: start;  // Vertikal ausrichten an der oberen Grenze

    .profile-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .comment-text-area {
      display: flex;
      flex-direction: column;
      flex-grow: 1;  // Nimmt den gesamten verfügbaren Platz ein
      text-align: left;  // Text linksbündig ausrichten

      .username {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }

      .comment-text {
        font-size: 12px;
        color: #1c1c1c;
      }
    }
  }

  .actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}


  .action-button {
  display: flex;
  align-items: center;
  justify-content: center; /* Zentrieren des Inhalts horizontal und vertikal */
  gap: 5px;
  background: none;
  border: none;
  color: #878a8c;
  font-size: 12px;
  cursor: pointer;
  
  .icon {
    color: #878a8c;
  }
  
  &:hover {
    color: #0079d3;
    
    .icon {
      color: #0079d3;
    }
  }
}

  
  .expand-button {
    font-size: 1.5rem;
  }

  .reply-form {
    margin-top: 10px;
    
    .reply-textarea {
      width: 100%;
      min-height: 50px;
      margin-bottom: 10px;
    }
    
    .reply-actions {
  display: flex;
  justify-content: center; /* Zentrieren des Inhalts horizontal */
  margin-top: 10px;

  button {
    margin-left: 10px;
  }
}
  }
  
  .replies-section {
    margin-top: 20px;
  }
}
</style>
