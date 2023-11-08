<template>
  <div class="comment-box" :id="commentId">



    <div class="comment-content" @click="handleRouterLinkClick(comment)">{{ trimmedCommentText }}</div>


    <div class="fromNotification" v-if="!disableelementsforNotifications">
      <div class="fromNotification" v-if="!disableelementsforNotifications">
        <!-- Anzeige ausblenden wenn es in der notification view gerendert -->
        <div class="user-info">
          <div class="header-comment">
            <img :src="author?.profileImage" alt="Profilbild" class="profile-image" @click="goToProfile" />
            <h5 class="username">{{ author?.name }}</h5>
            <div class="month">
              <p>{{ $store.getters.formattedCreatedAt(comment?.createdAt) }}</p>
            </div>
            <div class="badge-pro" v-if="comment.commentType == 'pro'">P</div>
            <div class="badge-contra" v-else>C</div>
          </div>
        </div>
      </div>

      <div class="actions">

        <button v-if="!showReplyForm" @click="showReplyForm = true" class="reply-button action-button">
          <font-awesome-icon :icon="['fas', 'commenting']" class="icon" :style="{ color: `var(--iconColor)` }" />
        </button>


        <!--Vote Buttons-->
        <button class="action-button" @click="upvoteComment(comment.id, currentUser.id, topic)" ref="upvoteButton">
          <font-awesome-icon :icon="hasLikedComment ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" class="icon"
            :style="{ color: `var(--iconColor)` }" />
          <p :style="{ color: `var(--iconColor)` }">{{ comment?.upvotes }}</p>
        </button>

        <button class="action-button" @click="downvoteComment(comment.id, currentUser.id, topic)" ref="downvoteButton">
          <font-awesome-icon :icon="hasDislikedComment ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" class="icon"
            :style="{ color: `var(--iconColor)` }" />
          <p :style="{ color: `var(--iconColor)` }">{{ comment?.downvotes }}</p>
        </button>

      <button v-if="isAdmin" @click="deleteComment(comment)" class="delete-button action-button">
        <font-awesome-icon :icon="['fas', 'trash']" class="icon" />
      </button>

      <div class="comment-box">
        <button @click="toggleOptionsMenu">...</button>
        <div v-if="showOptionsMenu" class="options-menu">
          <comment-options-menu></comment-options-menu>
        </div>
      </div>
        <div v-if="anzeige"> <!--Aufklapp Button-->
          <!--eslint-disable-->
          <button v-if="!showReplyForm && comment.replies && comment.replies.length && comment.showelement > 0"
            @click="comment.expandReplies = !comment.expandReplies" class="action-button">
            <font-awesome-icon :style="{ color: `var(--iconColor)` }" v-if="!comment.expandReplies"
              :icon="['fas', 'angle-down']" />
            <font-awesome-icon :style="{ color: `var(--iconColor)` }" v-else :icon="['fas', 'angle-up']" />
            <span :style="{ color: `var(--iconColor)` }" v-if="replyCount > 0">{{ replyCount + ' Replies'
            }}</span>
          </button>
          <!--eslint-ensable-->
        </div>
      </div>
      <div v-if="showReplyForm" class="reply-form">
        <textarea v-model="newReply" placeholder="Write your Answer..." class="reply-textarea"></textarea>
        <div class="reply-actions">
          <button @click="cancelReply" class="cancel-reply-button">Cancel</button>
          <button @click="submitReply(comment)" :style="{ backgroundColor: `var(--iconColor)` }"
            class="submit-reply-button">Reply</button>
        </div>
      </div>

      <div v-if="comment.expandReplies" class="replies-section">
        <comment-reply v-for="reply in comment.replies" :key="reply.id" :reply="reply" :topic="topic"
          :commentId="comment.id" :depth="1"></comment-reply>
      </div>




    </div>






  </div>
</template>


<script>
/* eslint-disable no-unused-vars */
import CommentOptionsMenu from './CommentOptionsMenu.vue';
import { v4 as uuidv4 } from 'uuid';
import { mapGetters } from 'vuex';
import CommentReply from './CommentReply.vue';

import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed, onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { ref } from 'vue';
import axios from "axios";


export default {
  components: {
    CommentReply,
    CommentOptionsMenu
  },

  props: {
    comment: {
      type: Object,
      required: true,
    },
    topic: {},
    showreply: {
      type: Boolean,
      default: true,
    },
    anzeige: {
      default: 'true',
    },
    disableelementsforNotifications: {
      default: false,
    }
  },

  setup(props) {
    const commentId = ref(props.comment.id);



    const comment = computed(() => props.comment);
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store
    const router = useRouter();
    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);
    const selectedTab = computed(() => store.state.selectedTab);
    const displayedCommentCount = computed(() => store.state.displayedCommentCount);
    const topicobjekt = store.getters.getTopicById(props.topic);

    const author = computed(() => store.getters.getUserById(props.comment.author))

    const findCommentIndex = (commentId, commentsArray) => {
      return commentsArray.findIndex(comment => comment.id === commentId);
    };
    const trimmedCommentText = computed(() => {
      if (props.disableelementsforNotifications && comment.value.text.length > 96) {
        return comment.value.text.substring(0, 96) + '...';
      }
      return comment.value.text;
    });

    onUnmounted(() => {
      comment.value.expandReplies = false;
    });



    const goToProfile = () => {
      console.log("klickt")
      console.log(currentUser.value)
      console.log(currentUser.value.id === comment.value.author)
      if (currentUser.value.id === comment.value.author) {
        router.push(`/profil/${comment.value.author}`);
      }
      else {
        router.push(`/profile/${comment.value.author}`);
      }

    }

    // Je nach props.comment. das entsprechende Array durchsuchen
    const commentArrayToSearch = computed(() => {
      if (props.comment.commentType === 'pro') {
        return topicobjekt.proComments;
      } else if (props.comment.commentType === 'contra') {
        return topicobjekt.contraComments;
      } else {
        return [];
      }
    });

    const commentIndex = computed(() => {
      return findCommentIndex(props.comment.id, commentArrayToSearch.value);
    });


    if (!comment.value.path) {

      const path = computed(() => {
        return `${topicobjekt.path}/${props.comment.commentType}_${commentIndex.value}`;
      });
      comment.value.path = path.value;
    }


    if (!comment.value.path) {
      console.log("Path wird gesetzt");
      console.log(topicobjekt.path);
      const path = computed(() => {
        return `${topicobjekt.path}/${props.comment.commentType}_${commentIndex.value}`;
      });
      // Create a copy of the comment prop
      const updatedComment = { ...comment.value }; // Create a copy of the computed comment
      // Modify the copy
      updatedComment.path = path.value;
      // Use the modified copy in your component
      comment.value = updatedComment;
    }

    return {

      currentUser,
      selectedTab,
      store,
      displayedCommentCount,
      topicobjekt,
      commentIndex,
      commentId,
      goToProfile,
      author,
      trimmedCommentText,

    };
  },

  data() {
    return {
      showOptionsMenu: false,
      showReplyForm: false,
      newReply: "",
      isAdmin:false,
    };
  },

  computed: {
    ...mapGetters(['getUserProfile']),
    ...mapGetters(['getTopicById']),

    visibleReplies() {
      // Return the first 'maxDisplayedReplies' number of replies to display
      return this.comment.replies ? this.comment.replies.slice(0, this.maxDisplayedReplies) : [];
    },

    hasLikedComment() {
      return this.currentUser.haslikedcomment.includes(this.comment.id);
    },
    hasDislikedComment() {
      return this.currentUser.hasdislikedcomment.includes(this.comment.id);
    },

    replyCount() {
      return this.comment.replies ? this.comment.replies.length : 0;
    },
  },
  methods: {

    toggleOptionsMenu() {
      this.showOptionsMenu = !this.showOptionsMenu;
    },

    blockUser() {
      this.$store.commit('ADD_USER_TO_BLOCKLIST', this.$store.currentUserId);
    },

    async checkAdmin() {
          this.$store
      .dispatch('checkAdmin')
      .then(() => {
        // 'checkAdmin' action has completed successfully; user is an admin
        // You can add any additional logic here for admin users
      })
      .catch(error => {
        if (error.response && error.response.status === 403) {
          // The server responded with a 403 status (Forbidden)
          console.error('Access denied. User is not an admin.');
          // Handle this case as needed, e.g., display an error message
        } else {
          // Handle other errors
          console.error('Error checking admin status:', error);
        }
      });
    },

    deleteComment(comment) {
    try {
      // Make an HTTP DELETE request to delete the comment on the server
      // You can call your store's deleteComment action here
      this.$store.dispatch('deleteComment', comment);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  },

    handleRouterLinkClick(comment) {

      const differenz = this.comment.commentIndex + 1 - this.displayedCommentCount;
      const puffer = 3;
      console.log("commentIndex: ", this.comment.commentIndex)
      console.log("displayedCommentCount: ", this.displayedCommentCount)
      console.log("differenz: ", differenz)

      if (differenz > 0) {
        console.log("wird erweitert")
        this.$store.commit('incrementDisplayedCommentCount', differenz + puffer);
      }
      if (comment.commentType === 'pro') {
        this.$store.state.selectedTab = 'pro';
        this.$store.state.selectedTabColor = 'green';
      } else {
        this.$store.state.selectedTab = 'contra';
        this.$store.state.selectedTabColor = 'red';
      }


      this.$router.push({
        name: 'topic-ganze-seite',
        params: {
          id: comment.topicId,
          commentId: comment.id
        }
      });




    },

    upvoteComment(commentId, currentUserId, topicId) {
      this.$store.dispatch('upvoteComment', { commentId, currentUserId, topicId, notificationType: "commentlike", zielId: this.comment.author, benachrichtigungsElementId: commentId });
      this.$nextTick(() => {
        this.animateButton(this.$refs.upvoteButton);
      });
    },

    downvoteComment(commentId, currentUserId, topicId) {
      this.$store.dispatch('downvoteComment', { commentId, currentUserId, topicId, notificationType: "commentdislike", zielId: this.comment.author, benachrichtigungsElementId: commentId });
      this.$nextTick(() => {
        this.animateButton(this.$refs.downvoteButton);
      });
    },




    // Funktion zum Einreichen einer Antwort
     submitReply(comment) {
      const newReply = {
        topicId: comment.topicId,
        id: uuidv4(),
        text: this.newReply,
        author: this.currentUser.id,
        upvotes: 0,
        downvotes: 0,
        createdAt: dayjs(),
        commentIndex: this.commentIndex,
        parentId: this.comment.id,
        Commentpath: comment.path,
        commentId: comment.id,
        commentType: comment.commentType,
        path: `${comment.path}/${comment.replies ? comment.replies.length : 0}`,
        expandReplies: false,
        depth: comment.depth + 1,
        replytype: "reply",
        commentobjektId: this.comment.id,
      };

      try {
        // Rufe die Aktion in deinem Store auf, um die Antwort hinzuzufügen
        this.$store.dispatch('addReplyAction', { newReply, comment, notificationType: "replyAddToComment", zielId: this.comment.author, benachrichtigungsElementId: newReply.id, userId: this.currentUser.id, topicId: comment.topicId });

        this.newReply = "";
        this.showReplyForm = false;
        // Überprüfe, ob die Tiefe (depth) 5 erreicht hat
        if (this.depth >= 5) {
          this.$emit('reply-clicked', comment.id);
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Antwort:", error);
        // Möglicherweise musst du hier Fehlerbehandlung hinzufügen
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
    },
  },

  created() {
    // Check if the user is an admin when the component is created
    this.checkAdmin();
  },
};
</script>

<style lang="scss" >
.badge-pro {
  font-weight: bold;
  font-size: 13px;
  color: green;
}

.badge-contra {
  font-size: 13px;
  color: red;
  font-weight: 700;

}

.green-badge {
  background-color: green;
  /* Hintergrundfarbe für den grünen Badge */
  color: white;
  /* border: 1px solid green; */
  height: 10px;
  width: 10px;
  border-radius: 20px;
}

.red-badge {
  background-color: red;
  /* Hintergrundfarbe für den roten Badge */
  color: white;
  /* border: 1px solid green; */
  height: 0px;
  width: 20px;
  border-radius: 20px;
}

.comment-content {
  padding-top: 10px;
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
    outline: none;
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
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e4e8;
  text-align: left;
  padding-left: 1vh;
  border-left: 2px solid #ccc;


  &:last-child {
    border-bottom: none;
  }

  .comment-text-area {
    display: flex; // Elemente nebeneinander anzeigen
    align-items: start; // Elemente am oberen Rand ausrichten

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .comment-content {
      flex-grow: 1; // Nimmt den gesamten verfügbaren Platz ein
      padding-top: 10px;
      font-size: 16px;
      word-break: break-word;

      .comment-text {
        font-size: 12px;
        color: #1c1c1c;

      }
    }



  }

  .profile-image {
    border-radius: 50%;
    width: 20px;

  }

  .actions {
    display: flex;
    align-items: center;
    gap: 18px;
    height: 20px;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    /* Zentrieren des Inhalts horizontal und vertikal */
    gap: 5px;
    background: none;
    border: none;
    color: #878a8c;
    font-size: 13px;
    cursor: pointer;
    padding: 0px;

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

        h5.username {
          margin: 0px;
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

  .comment-reply:not(:last-child) {
    border-bottom: 1px solid #ccc;
  }

  .expand-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    /* Die Breite des Buttons festlegen */
    height: 10px;
    /* Die Höhe des Buttons festlegen */
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
      justify-content: space-between;
      /* Zentrieren des Inhalts horizontal */
      margin-top: 10px;

      button {
        margin-left: 10px;
      }
    }
  }

  .replies-section {
    margin-top: 20px;
  }

  .header-comment {
    display: flex;
    gap: 0.5em;
    padding: 5px 0px 5px 0px;
    align-items: center;
    max-height: 50px;
    flex-wrap: wrap;
  }


}

.comment-box h5 {
  font-size: 12px;
  margin: 0px;
}

.month {
  font-size: 11px;
}

.month p {
  margin: 0px;
}
</style>