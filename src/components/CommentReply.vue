// CommentReply.vue
<template>
  <div class="comment-reply" v-if="reply">



    <div class="fromNotification" v-if="!disableelementsforNotifications">
            <div class="profile-info">
          <img :src="author?.profileImage" alt="Profilbild" class="profile-image" @click="goToProfile" />
          <h5 class="profile-name"  @click="goToProfile">{{ author?.name }}</h5>
          <div class="month">
            <p>{{ $store.getters.formattedCreatedAt(reply.createdAt) }}</p>
          </div>
        </div>

      <p class="antwort-text" id="antworttext" @click='goToTopic(reply.topicId)'>{{ reply?.text }}</p>

      <div class="buttons-container">
        <!-- Antwort-Button anzeigen, um auf diese Antwort zu antworten -->

        <button v-if="!showReplyForm && depth != 5" @click="openReplyForm" class="action-button">
          <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" :icon="['fas', 'commenting']"
            class="icon" />
        </button>
    <!-- Upvote Button -->
        <button @click="upvoteReplyAction(reply.id, currentUser.id, reply.topicId, reply.commentobjektId)"
          class="action-button" ref="upvoteButton">
          <font-awesome-icon :icon="hasLikedReply ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" class="icon"
            :style="{ color: iconColor(currentUser.farbe) }" />
          <p :style="{ color: iconColor(currentUser.farbe) }">{{ reply?.upvotes }}</p>
        </button>
        <!-- Downvote Button -->
        <button @click="downvoteReplyAction(reply.id, currentUser.id, reply.topicId, reply.commentobjektId)"
          class="action-button" ref="downvoteButton">
          <font-awesome-icon :icon="hasDislikedReply ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" class="icon"
            :style="{ color: iconColor(currentUser.farbe) }" />
          <p :style="{ color: iconColor(currentUser.farbe) }">{{ reply?.downvotes }}</p>
        </button>



        <!-- eslint-disable-->
        <button v-if="reply && !showReplyForm && reply.replies && reply.replies.length > 0"
          @click="reply.expandReplies = !reply.expandReplies" :class="['action-button', depth >= 5 ? 'disabled' : '']">
          <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" v-if="!reply.expandReplies"
            :icon="['fas', 'angle-down']" />
          <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" v-else :icon="['fas', 'angle-up']" />
          <p :style="{ color: iconColor(currentUser.farbe) }">{{ replyCount + ' Replies' }}</p>
        </button>


        <!--eslint-enable-->
        <!--Aufklapp Button-->
        <router-link :style="{ color: iconColor(currentUser.farbe) }" v-if="reply && depth === 5 && reply.id"
          :to="`/reply/${reply.id}`" class="more-link">
          Show more..
        </router-link>

      </div>


    </div>




    <!-- Anzeige der Antworten auf diese Antwort -->
    <div v-if="reply.expandReplies && reply && reply.replies && reply.replies.length > 0" class="replies-section">
      <comment-reply v-for="nestedReply in reply.replies" :key="nestedReply.id" :reply="nestedReply" :path="reply.path"
        :topic="topic" :depth="depth + 1"></comment-reply>
    </div>
    <div v-if="showReplyForm" class="reply-form">
      <textarea v-model="newReply" placeholder="Write your answer..." class="reply-textarea"></textarea>
      <div class="reply-actions">
        <button @click="cancelReply" class="cancel-reply-button">Cancel</button>
        <button @click="submitReply" :style="{ backgroundColor: iconColor(currentUser.farbe) }"
          class="submit-reply-button" ref="replyFormElement">Reply</button>
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
/* eslint-disable no-unused-vars */
import { computed, onBeforeMount, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

export default {
  props: {
    depth: {
      type: Number,
    },
    reply: { // Füge das 'reply'-Prop hinzu
      type: Object,

    },
    topic: {


    },
    commentId: {

    },
    path: {

    },
    isSinglePage: {
      default: false,
    },
    disableelementsforNotifications: {
      default: false,
    }

  },


  setup(props) {
    const displayedCommentCount = computed(() => store.state.displayedCommentCount);

    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store
    // Zugriff auf den currentUser aus dem Vuex-Store
    const router = useRouter();
    const currentUser = computed(() => store.state.currentUser);
    const reply = computed(() => props.reply);

    const author = computed(() => store.getters.getUserById(reply.value.author))
    // Verwenden Sie die Vuex Getter-Funktion, um das Kommentarobjekt basierend auf der ID abzurufen

    const comment = computed(() => getComment(reply.value.Commentpath));

    const commentObjekt = computed(() => comment);

    const commentIndex = computed(() => comment.value.commentIndex + 1);
    const replyIndex = computed(() => comment.value.replies.length);
    const nestedIndex = computed(() => reply.value.replies.length);

    let topicsSuche = [];
    let commentSuche = [];
    let replySuche = [];
    let nestedReplySuche = [];
    /*eslint-disable */
    const replydepth = reply.depth;
    const topics = store.state.topics;

    onUnmounted(() => {
      reply.value.expandReplies = false;
    });





    const parseId = (element) => {
      console.log(element)
      const parts = element.split('/').filter(part => part !== ''); // Entferne leere Teile
      const ids = {
        topicIndex: parts[0],
        type: parts[1].split('_')[0],
        commentIndex: parts[1].split('_')[1],
      };

      // Füge alle weiteren Teile als replyIndex hinzu
      for (let i = 2; i < parts.length; i++) {
        ids['replyIndex' + (i - 1)] = parts[i];
      }

      return ids;
    }

    const goToProfile = () => {
      console.log("klickt")
      console.log(currentUser.value)
      console.log()
      if (currentUser.value == reply.value.author) {
        router.push(`/profil/${reply.value.author}`);
      }
      else {
        router.push(`/profile/${reply.value.author}`);
      }

    }

    const getelement = (path) => {



      // Schleife durch die Pfade

      const ids = parseId(path); // Verwende die parseId Funktion, um die IDs zu extrahieren
      const anzahleindexes = Object.keys(ids).length - 1;



      let pathZurSuche = "";

      for (let i = 0; i < anzahleindexes; i++) {
        // Schleife durch die IDs
        if (i === 0) {
          pathZurSuche = `topics[${ids.topicIndex}]`;

        }
        else if (i === 1) {
          if (ids.type === 'pro') {
            pathZurSuche += `.proComments[${ids.commentIndex}]`;
          }
          else if (ids.type === 'contra') {
            pathZurSuche += `.contraComments[${ids.commentIndex}]`;

          }
        }
        else if (i === 2) {
          pathZurSuche += `.replies[${ids.replyIndex1}]`;

        }

        else if (i > 2) {
          let läufer = 2;
          pathZurSuche += `.replies[${ids['replyIndex' + läufer]}]`;
          läufer++
        }

      }

      // Speichern des gefundenen Objekts im entsprechenden Array basierend auf der Ebene
      let nestedreply = eval(pathZurSuche);
      if (anzahleindexes === 1) {
        topicsSuche.push(nestedreply);
      } else if (anzahleindexes === 2) {
        commentSuche.push(nestedreply);
      } else if (anzahleindexes === 3) {
        replySuche.push(nestedreply);
      } else if (anzahleindexes > 3) {
        nestedReplySuche.push(nestedreply);
      }





    }

    const getComment = (path) => {



      // Schleife durch die Pfade

      console.log(path + " comment")

      const ids = parseId(path); // Verwende die parseId Funktion, um die IDs zu extrahieren
      const anzahleindexes = Object.keys(ids).length - 1;



      let pathZurSuche = "";

      for (let i = 0; i < anzahleindexes; i++) {
        // Schleife durch die IDs
        if (i === 0) {
          pathZurSuche = `topics[${ids.topicIndex}]`;

        }
        else if (i === 1) {
          if (ids.type === 'pro') {
            pathZurSuche += `.proComments[${ids.commentIndex}]`;
          }
          else if (ids.type === 'contra') {
            pathZurSuche += `.contraComments[${ids.commentIndex}]`;

          }
        }
        else if (i === 2) {
          pathZurSuche += `.replies[${ids.replyIndex1}]`;

        }

        else if (i > 2) {
          let läufer = 2;
          pathZurSuche += `.replies[${ids['replyIndex' + läufer]}]`;
          läufer++
        }

      }

      // Speichern des gefundenen Objekts im entsprechenden Array basierend auf der Ebene
      return eval(pathZurSuche);

    }


    /*eslint-disable*/

    /*eslint-enable */
    if (!reply.value.replies) {
      reply.value.replies = [];
    }

    if (!reply.value.path && reply.value.depth >= 2) {

      getelement(props.path);





    }








    const goToTopic = () => {






      comment.value.expandReplies = false;







      console.log(props.reply)
      router.push({
        name: 'nested-reply-page',
        params: {
          path: props.reply.path
        }
      });







    };
    /*eslint-disable*/
    return {
      iconColor,
      currentUser,
      goToTopic,
      comment,
      topicsSuche,
      replySuche,
      commentSuche,
      nestedReplySuche,
      replydepth,
      goToProfile,
      commentObjekt,
      author,

      // Mache den currentUser verfügbar
    };
  },
  /*eslint-enable*/
  data() {
    return {
      showReplyForm: false,
      newReply: "",


    };
  },
  computed: {
    ...mapGetters(['getUserProfile', 'getCommentById']),
    replyCount() {

      return this.reply.replies ? this.reply.replies.length : 0;
    },

    hasLikedReply() {
      return this.currentUser.haslikedreply.includes(this.reply.id);
    },

    hasDislikedReply() {
      return this.currentUser.hasdislikedreply.includes(this.reply.id);
    },


  },

  methods: {


    ...mapActions(['upvoteComment', 'downvoteComment', 'removeUpvoteComment', 'removeDownvoteComment',]),



    openReplyForm() {
      this.showReplyForm = true;

      // Scroll zum Ende des Viewports
      this.$nextTick(() => {
        const windowHeight = window.innerHeight;
        const replyFormHeight = this.$refs.replyFormElement.clientHeight;
        const scrollToPosition = this.$refs.replyFormElement.offsetTop + replyFormHeight - windowHeight;

        window.scrollTo({
          top: scrollToPosition + 127,
          behavior: 'smooth',
        });
      });
    },

    upvoteReplyAction(replyId, currentUserId, topicId, commentId) {
      console.log(replyId + " reply id !")
      this.$store.dispatch('upvoteReply', { replyId, currentUserId, topicId, commentId, notificationType: "replylike", zielId: this.reply.author, benachrichtigungsElementId: replyId, });

      this.$nextTick(() => {
        this.animateButton(this.$refs.upvoteButton);
      });
    },

    downvoteReplyAction(replyId, currentUserId, topicId, commentId) {
      this.$store.dispatch('downvoteReply', { replyId, currentUserId, topicId, commentId:commentId, notificationType: "replydislike", zielId: this.reply.author, benachrichtigungsElementId: replyId, });
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
      try {
        // Bestimmen Sie den Index der aktuellen Antwort basierend auf der Anzahl der bereits vorhandenen Antworten
        const currentReplyIndex = this.reply.replies ? this.reply.replies.length : 0;

        // Erstellen Sie den Pfad für die neue Antwort
        const newPath = `${this.reply.path}/${currentReplyIndex}`;

        const newReply = {
          topicId: this.reply.topicId,
          id: uuidv4(),
          text: this.newReply,
          author: this.currentUser.id, // Aktueller Benutzer
          replies: [],
          upvotes: 0,
          downvotes: 0,
          createdAt: dayjs(),
          commentIndex: this.reply.commentIndex,
          parentId: this.reply.id,
          path: newPath,  // Setzen Sie den neu erstellten Pfad hier
          Commentpath: this.reply.Commentpath,
          depth: this.reply.depth + 1,
          replytype: "nested",
          commentobjektId: this.reply.commentobjektId,
          expandReplies: false,
        };
        // Fügt die neue Antwort zu den Antworten dieser Antwort hinzu
        /* eslint-disable */
        if (!this.reply.replies) {
          this.reply.replies = [];
        }

        this.reply.expandReplies = true;
        // Setzt das Antwort-Formular zurück
        this.$store.dispatch('submitReply', { reply: this.reply, newReply, notificationType: "replyAddToReply", zielId: this.reply.author, benachrichtigungsElementId: newReply.id, userId: this.currentUser.id, topicId: this.reply.topicId });
      
        this.newReply = "";
        this.showReplyForm = false;

        // Wenn die Verschachtelungstiefe 3 erreicht, leite den Benutzer zur gewünschten Seite weiter
        if (this.depth >= 5) {
          this.$emit('reply-clicked', this.reply.id);
        }
      }
      catch (error) {
        console.error('Fehler beim Hinzufügen der Antwort:', error);
      }
    },
    /* eslint-enable*/


    // Funktion zum Abbrechen der Antwort auf diese Antwort
    cancelReply() {
      this.newReply = "";
      this.showReplyForm = false;

    },
  },
};
</script>

<style lang="scss" scoped>
.antwort-text {
  padding-left: 5px;
}
p#antworttext {
    padding-top: 0px;
}

.month {
  font-size: 11px;
  padding-left: 10px;
  border-left: none;
}


.comment-reply {
  border-left: 2px solid #ccc;
padding-left: 5px;
  position: static;

  /* Setze die Position auf static */
  .profile-info {
    display: flex;
    align-items: center;
    padding-left: 5px;

  }

  .profile-image {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
  }

  .profile-name {
    color: #000000;
    font-size: 12px;
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
    padding-left: 2%;
    /* Adjusted padding for nested replies */
  }



  .buttons-container {
    display: flex;
    gap: 18px;
    padding-right: 1px;
    margin: 0px;
    padding-bottom: 5px;
  }

  .action-button {
    background: none;
    border: none;
    color: #878a8c;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
       padding-left: 5px;
  }
.action-button p {
    margin: 0px;
}
  .action-button:hover {
    color: #0079d3;
  }

  .icon {
    font-size: 1.3em;
  }

  .antwort-text {
    overflow-wrap: break-word; // Damit lange Worte nicht aus dem Container laufen
    word-wrap: break-word; // Für ältere Browser
    font-size: 14px;
    font-family: Arial, Helvetica, sans-serif;

    margin-top: 5px;
    margin-top: 0px;


    padding-bottom: 0px;
    margin-bottom: 0px;
    text-align: left;
    padding-top: 10px;
  }


  .right-aligned-button {
    margin-left: auto;
  }

  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.profile-info {
  height: 25px;
  padding-top: 5px;
      padding-bottom: 5px;

}

.antworttext {
  padding-left: 5px;
}</style>