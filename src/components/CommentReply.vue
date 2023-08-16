// CommentReply.vue
<template>

  
<div class="comment-reply" v-if="reply">
    <div class="profile-info">
      <img :src="reply?.author?.profileImage" alt="Profilbild" class="profile-image" />
      <h5 class="profile-name">{{ reply?.author?.name }}</h5>
    </div>
    <p class="antwort-text">{{ reply?.text }}</p>
    <!-- Antwort-Formular anzeigen, wenn auf diese Antwort geantwortet werden soll -->
   




    <div class="buttons-container">

      
      <!-- "Mehr anzeigen" Link anzeigen, wenn die Verschachtelungstiefe genau 3 ist -->


      <!-- Antwort-Button anzeigen, um auf diese Antwort zu antworten -->
      <button  v-if="!showReplyForm && depth < 3" @click="showReplyForm = true" class=" action-button">
        <font-awesome-icon :style="{ color: iconColor(currentUser.party) }" :icon="['fas', 'commenting']" class="icon"/>
      </button>

    <!-- Upvote Button -->
    <button @click="upvoteReplyAction(reply)" class="action-button">
    <font-awesome-icon
      :icon="[ 'far', 'thumbs-up']"
      class="icon"
      :style="{ color: iconColor(currentUser.party) }"
    />
    <p :style="{ color: iconColor(currentUser.party) }">{{ reply?.votes?.upvotes }}</p>
  </button>

    <!-- Downvote Button -->
    <button @click="downvoteReplyAction(reply)" class="action-button">
      <font-awesome-icon
        :icon="[ 'far', 'thumbs-down']"
        class="icon"
        :style="{ color: iconColor(currentUser.party) }"
      />
      <p :style="{ color: iconColor(currentUser.party) }">{{ reply?.votes?.downvotes }}</p>
    </button>
<!-- {{ replyCount+ ' Antworten' }} -->

<button
  v-if="reply && !showReplyForm && reply.replies && reply.replies.length > 0"
  @click="expandReplies = !expandReplies"
  :class="[ 'action-button', depth >= 3 ? 'disabled' : '']"
>
  <font-awesome-icon
    :style="{ color: iconColor(currentUser.party) }"
    v-if="!expandReplies"
    :icon="['fas', 'angle-down']"
  />
  <font-awesome-icon
    :style="{ color: iconColor(currentUser.party) }"
    v-else
    :icon="['fas', 'angle-up']"
  />
  <p :style="{ color: iconColor(currentUser.party) }">{{ replyCount + ' Replies' }}</p>
</button>

<!--Aufklapp Button-->
<router-link  :style="{ color: iconColor(currentUser.party) }" v-if="reply && depth === 3 && reply.id" :to="`/comment/${reply.id}`" class="more-link">
  Show more..
</router-link>
</div>




    <!-- Anzeige der Antworten auf diese Antwort -->
    <div v-if="expandReplies && reply && reply.replies && reply.replies.length > 0" class="replies-section">
  <comment-reply
    v-for="nestedReply in reply.replies"
    :key="nestedReply.id"
    :reply="nestedReply"
    :depth="depth + 1"
    @reply-clicked="$emit('reply-clicked', $event)"
  ></comment-reply>
</div>
<div v-if="showReplyForm" class="reply-form">
      <textarea v-model="newReply" placeholder="Write your answer..." class="reply-textarea"></textarea>
      <div class="reply-actions">
        <button @click="cancelReply" class="cancel-reply-button">Cancel</button>
        <button @click="submitReply" :style="{ backgroundColor: iconColor(currentUser.party)}" class="submit-reply-button">Reply</button>
      </div>
    </div>
    <!--Antwortbox-->


  </div>
</template>
 
<script >
import { v4 as uuidv4 } from 'uuid';
import { mapGetters, mapActions } from 'vuex';
import { iconColor } from './farben';
import { useStore } from 'vuex';
import { computed, ref } from 'vue';

export default {
props:{
depth: {
  type: Number,
  default: 1,
},
reply: { // Füge das 'reply'-Prop hinzu
      type: Object,
      required: true,
    },
},


  setup(props) {

    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);

 

 
    return {
      iconColor,

      currentUser,
   
 // Mache den currentUser verfügbar
    };
  },


  data() {
    return {
    showReplyForm: false,
    newReply: "",
    expandReplies: false,

    };
  },
  computed: {
    ...mapGetters(['getUserProfile', 'getCommentById']),

    replyCount() {
    return this.reply.replies ? this.reply.replies.length : 0;

    },
   


  },



  methods: {

    ...mapActions(['upvoteComment', 'downvoteComment', 'removeUpvoteComment', 'removeDownvoteComment', 'addReplyToComment']),
   


  
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

<style lang="scss">
.comment-reply {
  border-left: 1px solid #ccc;
  max-width: 99%;

  .profile-info {
    display: flex;
    align-items: center;
    padding-left: 1%;
  }

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
    margin: 0;
  }

  .comment-text {
    color: #1c1c1c;
  font-size: 14px;
  text-align: left;

  }

  .more-link {
    display: inline-block;
    margin-top: 10px;
    color: #0079d3;
    font-size: 12px;
    font-weight: 400;
    text-decoration: none;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 5px;
  }

  .reply-button {
    display: flex;
    margin-top: 15px;
    color: #878a8c;
    background: none;
    border: none;
    cursor: pointer;
  }

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
      justify-content: space-between;
      margin-top: 10px;
      margin-bottom: 10px;

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
      }
    }
  }

  .replies-section {
    margin-top: 10px;
    padding-left: 3%; /* Adjusted padding for nested replies */
  }

  .expand-button {
    border: none;
    background: none;
    cursor: pointer;
  }

  .buttons-container {
    display: flex;
    gap: 18px;
    padding-left: 15%;
    padding-right: 1px;
  }

  .action-button {
    background: none;
    border: none;
    color: #878a8c;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .action-button:hover {
    color: #0079d3;
  }

  .icon {
    font-size: 1.3em;
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