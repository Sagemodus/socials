<template>

<div class="comment-box">
    <div class="user-info">
      <div class="header-comment">
        <img :src="comment?.author?.profileImage" alt="Profilbild" class="profile-image" />
        <h5 class="username">{{ comment?.author?.name }}</h5>
        <p>{{ $store.getters.formattedCreatedAt(comment?.createdAt) }}</p>
      </div>
    </div>
    <div class="comment-content">
      <p class="comment-text" @click='goToTopic(comment.topicId)'>{{ comment?.text }}</p>
    </div>

    <div class="actions">
      <button v-if="!showReplyForm" @click="showReplyForm = true" class="reply-button action-button">
        <font-awesome-icon :icon="['fas', 'commenting']" class="icon" :style="{ color: iconColor(currentUser.farbe) }"/>
      </button>
      
      <!--Vote Buttons-->
      <button class="action-button"
  @click="upvoteComment(comment.id,currentUser.id,topic)"
  ref="upvoteButton">
  <font-awesome-icon :icon="hasLikedComment ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" class="icon" :style="{ color: iconColor(currentUser.farbe) }" />
  <p :style="{ color: iconColor(currentUser.farbe) }">{{ comment?.upvotes }}</p>
</button>

<button class="action-button"
  @click="downvoteComment(comment.id,currentUser.id,topic)"
  ref="downvoteButton">
  <font-awesome-icon :icon="hasDislikedComment ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" class="icon" :style="{ color: iconColor(currentUser.farbe) }" />
  <p :style="{ color: iconColor(currentUser.farbe) }">{{ comment?.downvotes }}</p>
</button>


      <!--Aufklapp Button-->
      <button v-if="!showReplyForm && comment.replies && comment.replies.length > 0" @click="expandReplies = !expandReplies" class="action-button">
        <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" v-if="!expandReplies" :icon="['fas', 'angle-down']" />
        <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" v-else :icon="['fas', 'angle-up']" />
        <span :style="{ color: iconColor(currentUser.farbe) }" v-if="replyCount > 0">{{ replyCount+ ' Replies'}}</span>
      </button>
    </div>

    <div v-if="showReplyForm" class="reply-form">
      <textarea v-model="newReply" placeholder="Write your Answer..." class="reply-textarea"></textarea>
      <div class="reply-actions">
        <button @click="cancelReply" class="cancel-reply-button">Cancel</button>
        <button @click="submitReply(comment)" :style="{ backgroundColor: iconColor(currentUser.farbe) }" class="submit-reply-button">Reply</button>
      </div>
    </div>

    <div v-if="expandReplies" class="replies-section">
      <comment-reply
        v-for="reply in comment.replies"
        :key="reply.id"
        :reply="reply"
        :depth="1"
        :topic="topic"
        :commentId="comment.id"
        @reply-clicked="onReplyClicked"
      ></comment-reply>
    </div>
  </div>
</template>


<script>
import { v4 as uuidv4 } from 'uuid';
import { mapGetters} from 'vuex';
import CommentReply from './CommentReply.vue';
import { iconColor } from './farben';
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed } from 'vue'; 
import { useRouter } from 'vue-router';
export default {


components: {
  CommentReply,
},

props: {
  comment: {
    type: Object,
    required: true,
  },
  topic: {
    type: String,
   
  },
},

setup() {
const store = useStore(); // Erhalte Zugriff auf den Vuex-Store
const router = useRouter();
// Zugriff auf den currentUser aus dem Vuex-Store
const currentUser = computed(() => store.state.currentUser);

const selectedTab = computed (() => store.state.selectedTab);

    const goToTopic = (topicId) => {
      console.log("gedrückt")
  router.push(`/topic/${topicId}`);
};
return {
  iconColor,
  currentUser,
  selectedTab,
  store,
  goToTopic
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
 
  hasLikedComment() {
    return this.currentUser.haslikedcomment.includes(this.comment.id);
  },
  hasDislikedComment() {
    return this.currentUser.hasdislikedcomment.includes( this.comment.id );
  },

replyCount() {
  return this.comment.replies ? this.comment.replies.length : 0;
},



},
methods: {

  
  upvoteComment(commentId, currentUserId,topicId) {
    this.$store.dispatch('upvoteComment', { commentId ,currentUserId,topicId});
    this.$nextTick(() => {
      this.animateButton(this.$refs.upvoteButton);
    });
  },

  downvoteComment(commentId,currentUserId,topicId) {
    this.$store.dispatch('downvoteComment', { commentId,currentUserId,topicId });
    this.$nextTick(() => {
      this.animateButton(this.$refs.downvoteButton);
    });
  },




  // Funktion zum Einreichen einer Antwort
  submitReply(comment) {
    console.log(this.getUserProfile)
  const newReply2 = {
    topicId:comment.topicId,
    id: uuidv4(),
    text: this.newReply,
    author: this.getUserProfile,
     upvotes: 0, 
     downvotes: 0,
    createdAt: new Date(),
  };

  if (!comment.replies) {
    comment.replies = [];
  }

  
  this.currentUser.createdReplies.push(newReply2.id)
  comment.replies.push(newReply2);

  


  this.newReply = "";
  this.showReplyForm = false;

  if (this.depth >= 5) {
    this.$emit('reply-clicked', comment.id);
  }
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

  animateButton(buttonRef) {
    const button = buttonRef;
    button.animate(
      [
        // keyframes
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' }
      ],
      {
        // timing options
        duration: 400,
        easing: 'ease-in-out'
      }
    );
    }




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
  padding-left: 1vh;
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
justify-content:space-evenly;
align-items: center;
gap: 10px;


}


.action-button {
display: flex;
align-items: center;
justify-content:space-evenly;/* Zentrieren des Inhalts horizontal und vertikal */
gap: 5px;
background: none;
border: none;
color: #878a8c;
font-size: 13px;
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
  gap: 0.5em;
  
  align-items: center;
  max-height: 50px;
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