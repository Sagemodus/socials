<template>
  <div class="comment-box">
    <div class="user-info">
      <div class="header-comment">
        <img :src="comment?.author?.profileImage" alt="Profilbild" class="profile-image" />
        <h5 class="username">{{ comment?.author?.name }}</h5>
      </div>
    </div>
    <div class="comment-content">
      <p class="comment-text">{{ comment?.text }}</p>
    </div>

    <div class="actions">
      <button v-if="!showReplyForm" @click="showReplyForm = true" class="reply-button action-button">
        <font-awesome-icon :icon="['fas', 'commenting']" class="icon" :style="{ color: iconColor(currentUser.party) }"/>
      </button>
      <button  class="action-button">

        <!--Vote Buttons-->
  <font-awesome-icon @click="upvoteComment(comment.id)" :icon="['far', 'thumbs-up']" class="icon" :style="{ color: iconColor(currentUser.party) }"/>
  <p :style="{ color: iconColor(currentUser.party) }">{{ comment?.votes?.upvotes }}</p>
</button>
<button class="action-button">
  <font-awesome-icon @click="downvoteComment(comment.id)" :icon="['far', 'thumbs-down']" class="icon" :style="{ color: iconColor(currentUser.party) }"/>
  <p :style="{ color: iconColor(currentUser.party) }">{{ comment?.votes?.downvotes }}</p>
</button>


      <button v-if="!showReplyForm && comment.replies && comment.replies.length > 0" @click="expandReplies = !expandReplies" class="action-button">
        <font-awesome-icon :style="{ color: iconColor(currentUser.party) }" v-if="!expandReplies" :icon="['fas', 'angle-down']" />
        <font-awesome-icon :style="{ color: iconColor(currentUser.party) }" v-else :icon="['fas', 'angle-up']" />
        <span :style="{ color: iconColor(currentUser.party) }" v-if="replyCount > 0">{{ replyCount+ ' Replies'}}</span>
      </button>
    </div>

    <div v-if="showReplyForm" class="reply-form">
      <textarea v-model="newReply" placeholder="Write your Answer..." class="reply-textarea"></textarea>
      <div class="reply-actions">
        <button @click="cancelReply" class="cancel-reply-button">Cancel</button>
        <button @click="submitReply" :style="{ backgroundColor: iconColor(currentUser.party) }" class="submit-reply-button">Reply</button>
      </div>
    </div>

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
import { iconColor } from './farben';
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed } from 'vue'; 

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

setup(props) {
const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

// Zugriff auf den currentUser aus dem Vuex-Store
const currentUser = computed(() => store.state.currentUser);

// Zustand von Upvote und Downvote aus dem Vuex-Store holen


return {
  iconColor,
  currentUser,

};
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
 
replyCount() {
  return this.comment.replies ? this.comment.replies.length : 0;
},



},
methods: {
  
  upvoteComment(commentId) {
    this.$store.dispatch('upvoteComment', { commentId });
  },

  downvoteComment(commentId) {
    this.$store.dispatch('downvoteComment', { commentId });
  },



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
    this.replyHovered = false;  // Setze replyHovered auf false
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

  .reply-textarea {
    width: 95%;
    min-height: 50px;
    resize: vertical;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .reply-actions {
    display: flex;
    justify-content: space-evenly;
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
      color: #fff;
      border-color: #ccc;
    }
  }
}





.comment-box {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e4e8;
  font-family: Verdana, Geneva, sans-serif;
  padding-left: 10px;
  border-left: 2px solid #ccc;

  &:last-child {
    border-bottom: none;
  }

  

.comment-text-area {
  display: flex;  // Elemente nebeneinander anzeigen
  align-items: start;  // Elemente am oberen Rand ausrichten
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;



    .username {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
  }

  .comment-content {
    flex-grow: 1;  // Nimmt den gesamten verfügbaren Platz ein

    .comment-text {
      font-size: 12px;
      color: #1c1c1c;
    }
  }


 
}
.profile-image {
   border-radius: 50%;
   max-width: 90%;
    
  }

.actions {
display: flex;
justify-content:flex-start;
align-items: center;
gap: 18px;
padding-left: 15%;

}


.action-button {
display: flex;
align-items: center;
justify-content:space-evenly;/* Zentrieren des Inhalts horizontal und vertikal */
gap: 5px;
background: none;
border: none;
color: #878a8c;
font-size: 12px;
cursor: pointer;

.icon {
  color: #878a8c;
  font-size: 1.3em;
}

&:hover {
  color: #0079d3;
  
  .icon {
    color: #0079d3;
  }
}


.replies-section {
    margin-top: 20px;
    padding-left: 20px;

    .comment-reply {
      margin-bottom: 10px;
      border-left: 2px solid #ccc;
      padding-left: 15px;
      transition: background-color 0.3s, border-color 0.3s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        border-color: #0079d3;
      }

      .user-info {
        margin-bottom: 5px;
      }

      .username {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }

      .comment-content {
        .comment-text {
          font-size: 12px;
          color: #1c1c1c;
        }
      }
    }
  }
}

.expand-button {
display: flex;
align-items: center;
justify-content: center;
width: 10px;  /* Die Breite des Buttons festlegen */
height: 10px; /* Die Höhe des Buttons festlegen */
font-size: 1.5rem;
}


.reply-form {
  margin-top: 10px;
  
  .reply-textarea {
    width: 95%;
    min-height: 50px;
    
  }
  
  .reply-actions {
display: flex;
justify-content: space-between;/* Zentrieren des Inhalts horizontal */
margin-top: 10px;


button {
  margin-left: 10px;
}
}
}

.replies-section {
  margin-top: 20px;
}


.header-comment{
  display: flex;
  gap: 2%;
  padding-left: 1%;
  align-items: center;
  flex-wrap: wrap;
}

.nested-reply {
    margin-left: 15px; /* Größere Einrückung für verschachtelte Kommentare */
    border-left: 2px solid #ddd; /* Unterschiedliche Farbe für den linken Strich */
    padding-left: 10px; /* Zusätzliche Einrückung für den Inhalt */
  }

}
.comment-box h5{
  font-size: 14px;
}
</style>