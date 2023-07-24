<template>
  <div class="comment-box">
    <img :src="comment?.author?.profileImage" alt="Profilbild" class="profile-image" />
    <div class="profile-info">
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

    <!-- Aufklapp-Button für Antworten -->
    <button v-if="!showReplyForm && comment.replies && comment.replies.length > 0" @click="expandReplies = !expandReplies" class="expand-button">

      <img v-if="!expandReplies" src="/pfad/zum/plus-icon.svg" alt="Plus Icon">
      <img v-else src="/pfad/zum/minus-icon.svg" alt="Minus Icon">
    </button>

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

    .comment-text {
      font-size: 14px;
      color: #586069;
      margin-top: 5px;
    }
  }
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
