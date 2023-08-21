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
      <button  v-if="!showReplyForm && depth < 5" @click="showReplyForm = true" class=" action-button">
        <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" :icon="['fas', 'commenting']" class="icon"/>
      </button>

    <!-- Upvote Button -->
    <button @click="upvoteReplyAction(reply.id)" class="action-button" ref="upvoteButton">
    <font-awesome-icon
    :icon="reply.hasUpvoted ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']"
      class="icon"
      :style="{ color: iconColor(currentUser.farbe) }"
    />
    <p :style="{ color: iconColor(currentUser.farbe) }">{{ reply?.votes?.upvotes }}</p>
  </button>

    <!-- Downvote Button -->
    <button @click="downvoteReplyAction(reply.id)" class="action-button" ref="downvoteButton">
      <font-awesome-icon
      :icon="reply.hasDownvoted ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" 
        class="icon"
        :style="{ color: iconColor(currentUser.farbe) }"
      />
      <p :style="{ color: iconColor(currentUser.farbe) }">{{ reply?.votes?.downvotes }}</p>
    </button>
<!-- {{ replyCount+ ' Antworten' }} -->

<button
  v-if="reply && !showReplyForm && reply.replies && reply.replies.length > 0"
  @click="expandReplies = !expandReplies"
  :class="[ 'action-button', depth >= 5 ? 'disabled' : '']"
>
  <font-awesome-icon
    :style="{ color: iconColor(currentUser.farbe) }"
    v-if="!expandReplies"
    :icon="['fas', 'angle-down']"
  />
  <font-awesome-icon
    :style="{ color: iconColor(currentUser.farbe) }"
    v-else
    :icon="['fas', 'angle-up']"
  />
  <p :style="{ color: iconColor(currentUser.farbe) }">{{ replyCount + ' Replies' }}</p>
</button>

<!--Aufklapp Button-->
<router-link  :style="{ color: iconColor(currentUser.farbe) }" v-if="reply && depth === 5 && reply.id" :to="`/reply/${reply.id}`" class="more-link">
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
        <button @click="submitReply" :style="{ backgroundColor: iconColor(currentUser.farbe)}" class="submit-reply-button">Reply</button>
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
import { computed } from 'vue';

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


  setup() {

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
    ...mapActions([
      'upvoteComment',
      'downvoteComment',
      'removeUpvoteComment',
      'removeDownvoteComment',
      'addReplyToComment',
    ]),
   
    upvoteReplyAction(replyId) {
    this.$store.dispatch('upvoteReply', { replyId });
    this.$nextTick(() => {
      this.animateButton(this.$refs.upvoteButton);
    });
  },

  downvoteReplyAction(replyId) {
    this.$store.dispatch('downvoteReply', { replyId });
    this.$nextTick(() => {
      this.animateButton(this.$refs.downvoteButton);
    });
  },

  animateButton(buttonRef) {
    const button = buttonRef;
    button.animate(
      [// keyframes
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
    },
  
    // Funktion zum Einreichen einer Antwort auf diese Antwort
    submitReply() {
      const newReply = {
        id: uuidv4(),
        text: this.newReply,
        author: this.getUserProfile(),
        replies: [],
      };

      const localReply = ref(this.reply); // Create a local variable to store modified reply
      if (!localReply.value.replies) {
        localReply.value.replies = [];
      }
      localReply.value.replies.push(newReply);

      this.newReply = "";
      this.showReplyForm = false;

      if (this.depth >= 5) {
        this.$emit('reply-clicked', localReply.value.id);
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
  padding-right: 10px;

  .profile-info {
    display: flex;
    align-items: center;
    padding-left: 0.3em;
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
    padding-left: 2%; /* Adjusted padding for nested replies */
  }

  .expand-button {
    border: none;
    background: none;
    cursor: pointer;
  }

  .buttons-container {
    display: flex;
    gap: 18px;
    padding-left:30px;
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