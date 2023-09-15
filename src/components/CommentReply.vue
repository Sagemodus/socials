// CommentReply.vue
<template>
  <div class="comment-reply" v-if="reply">
    <div class="profile-info">
      <img :src="reply?.author?.profileImage" alt="Profilbild" class="profile-image" />
      <h5 class="profile-name">{{ reply?.author?.name }}</h5>
      <div class="month">
        <p>{{ $store.getters.formattedCreatedAt(reply.createdAt) }}</p>
      </div>
    </div>
    <p class="antwort-text" @click='goToTopic(reply.topicId)'>{{ reply?.text }}</p>



    <div class="buttons-container">




      <!-- Antwort-Button anzeigen, um auf diese Antwort zu antworten -->
      <button v-if="!showReplyForm && depth < 5" @click="openReplyForm" class="action-button">
        <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" :icon="['fas', 'commenting']" class="icon" />
      </button>

      <!-- Upvote Button -->
      <button @click="upvoteReplyAction(reply.id, currentUser.id, topic, commentId)" class="action-button"
        ref="upvoteButton">
        <font-awesome-icon :icon="hasLikedReply ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" class="icon"
          :style="{ color: iconColor(currentUser.farbe) }" />
        <p :style="{ color: iconColor(currentUser.farbe) }">{{ reply?.upvotes }}</p>
      </button>



      <!-- Downvote Button -->
      <button @click="downvoteReplyAction(reply.id, currentUser.id, topic, commentId)" class="action-button"
        ref="downvoteButton">
        <font-awesome-icon :icon="hasDislikedReply ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" class="icon"
          :style="{ color: iconColor(currentUser.farbe) }" />
        <p :style="{ color: iconColor(currentUser.farbe) }">{{ reply?.downvotes }}</p>
      </button>


      <button v-if="reply && !showReplyForm && reply.replies && reply.replies.length > 0"
        @click="reply.expandReplies = !reply.expandReplies" :class="['action-button', depth >= 5 ? 'disabled' : '']">
        <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" v-if="!reply.expandReplies"
          :icon="['fas', 'angle-down']" />
        <font-awesome-icon :style="{ color: iconColor(currentUser.farbe) }" v-else :icon="['fas', 'angle-up']" />
        <p :style="{ color: iconColor(currentUser.farbe) }">{{ replyCount + ' Replies' }}</p>
      </button>

      <!--Aufklapp Button-->
      <router-link :style="{ color: iconColor(currentUser.farbe) }" v-if="reply && depth === 5 && reply.id"
        :to="`/reply/${reply.id}`" class="more-link">
        Show more..
      </router-link>
    </div>




    <!-- Anzeige der Antworten auf diese Antwort -->
    <div v-if="reply.expandReplies && reply && reply.replies && reply.replies.length > 0" class="replies-section">
      <comment-reply v-for="nestedReply in reply.replies" :key="nestedReply.id" :reply="nestedReply" :path="reply.path"
        :depth="depth + 1" :topic="topic" :commentId="reply.id" :commentobjekt="comment?.value"
        @reply-clicked="$emit('reply-clicked', $event)"></comment-reply>
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
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  props: {
    depth: {
      type: Number,
      default: 1,
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
    commentobjekt: {

    },

  },


  setup(props) {
    const displaycommentcount = computed(() => store.state.displayedCommentCount);

    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store
    // Zugriff auf den currentUser aus dem Vuex-Store
    const router = useRouter();
    const currentUser = computed(() => store.state.currentUser);
    const reply = computed(() => props.reply);
    const comment = computed(() => reply.value.commentobjekt);
    const commentIndex = computed(() => reply.value.commentIndex + 1);
    const replyIndex = computed(() => comment.value.replies.length);
    const nestedIndex = computed(() => reply.value.replies.length);
    let topicsSuche = [];
    let commentSuche = [];
    let replySuche = [];
    let nestedReplySuche = [];
    const commentelement = 2;
    const replyelement = 3;
    const topicselement = 1;
    const replydepth = props.depth;
    const topics =  store.state.topics;


    onMounted(() => {

      const parseId = (element) => {
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



      const getelement = (path) => {

        topicsSuche.value = [];
        commentSuche.value = [];
        replySuche.value = [];
        nestedReplySuche.value = [];

        // Schleife durch die Pfade

        const ids = parseId(path); // Verwende die parseId Funktion, um die IDs zu extrahieren
        const anzahleindexes = Object.keys(ids).length - 1;

        console.log(ids)
        console.log(anzahleindexes)

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
        console.log(pathZurSuche);
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


        console.log(topicsSuche);
        console.log(commentSuche);
        console.log(replySuche);
        console.log(nestedReplySuche);
        // Hier sollten Sie jetzt Zugriff auf die gewünschten Kommentare haben



      }



      if (!reply.depth) {
        reply.value.depth = props.depth;
      }

      if (!reply.replies) {
        reply.value.replies = [];
      }

      if (!reply.value.path && props.depth >= 2) {
        console.log("Path wird gesetzt" + props.path);
        console.log("Path wird gesetzt1" + nestedReplySuche[0]);
        getelement(props.path);

        // Verwende "nestedReplySuche", wenn es Werte gibt, andernfalls "replySuche"
        const replySearch = nestedReplySuche.length > 0 ? nestedReplySuche : replySuche;
       
        // Aktualisiere den Pfad basierend auf der Länge der Antworten
        reply.value.path = `${props.path}/${replySearch[0]?.replies.length - 1}`;
        reply.value.author.nestedReplies.push(reply.value.path);

        console.log(reply.value.path+"hallo bruder")
      }






      if (!reply.value.path && props.depth <= 1) {

        const path = computed(() => {
          return `${reply.value.commentobjekt.path}/${replyIndex.value - 1}`;
        });
        reply.value.path = path.value;
      }


     } 
      
      
      
      );

      console.log("hallo")
  

    
  


    const saveCommentDataToStore = () => {
      console
      store.dispatch('commentundreply', { comment: comment, reply: reply.value });
    };
    saveCommentDataToStore();

    const goToTopic = (topicId) => {
      console.log(comment.value);
      const differenz = commentIndex.value - displaycommentcount.value;
      const puffer = 3;

      if (commentIndex.value == 0) {
        commentIndex.value = comment.value.commentIndex
      }


      if (props.depth > 1) {
        if (commentIndex.value > displaycommentcount.value)
          if (props.depth > 2) {
            comment.value.expandReplies = false;
          }

        saveCommentDataToStore();
        setTimeout(() => {



          console.log(comment.value.commentType);
          router.push({
            name: 'nested-reply-page', // Der Name der Route (stellen Sie sicher, dass Sie diesen Namen in Ihrer Route-Definition haben)
            params: {
              id: topicId,
              commentId: comment.value.id || props.commentId, // Falls commentId nicht vorhanden ist, setzen Sie ihn auf null (optional)
              replyId: props.reply.id, // Falls replyId nicht vorhanden ist, setzen Sie ihn auf null (optional)

            },
          });
        }, 50);
      }
      else {
        console.log(commentIndex.value)
        console.log(displaycommentcount.value)


        console.log(differenz);
        comment.value.expandReplies = true;

        if (commentIndex.value > displaycommentcount.value) {
          store.commit('incrementDisplayedCommentCount', differenz + puffer);
        }
        console.log(commentIndex.value);
        if (comment.value.commentType === 'pro') {
          store.state.selectedTab = 'pro';
          store.state.selectedTabColor = 'green';
        } else {
          store.state.selectedTab = 'contra';
          store.state.selectedTabColor = 'red';
        }
        setTimeout(() => {
          router.push({
            name: 'topic-ganze-seite', // Der Name der Route (stellen Sie sicher, dass Sie diesen Namen in Ihrer Route-Definition haben)
            params: {
              id: topicId,
              commentId: comment.value.id || props.commentId, // Falls commentId nicht vorhanden ist, setzen Sie ihn auf null (optional)
              replyId: props.reply.id || null, // Falls replyId nicht vorhanden ist, setzen Sie ihn auf null (optional)

            },
          });
        }, 20);




      }






    };

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

      // Mache den currentUser verfügbar
    };
  },

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

    isCreatedByCurrentUser(reply) {
      return this.currentUser.createdReplies.includes(reply.id);
    },

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
      console.log(commentId)
      console.log("ausgelösd")
      this.$store.dispatch('upvoteReply', { replyId, currentUserId, topicId, commentId });
      this.$nextTick(() => {
        this.animateButton(this.$refs.upvoteButton);
      });
    },

    downvoteReplyAction(replyId, currentUserId, topicId, commentId) {
      console.log("ausgelösd")
      this.$store.dispatch('downvoteReply', { replyId, currentUserId, topicId, commentId });
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
      console.log(this.reply.commentobjekt)
      const newReply = {
        topicId: this.topic,
        id: uuidv4(),
        text: this.newReply,
        author: this.currentUser, // Aktueller Benutzer
        replies: [],
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),// Initialisiere die Votes für die Antwort
        commentIndex: this.commentIndex + 1,
        commentobjekt : this.reply.commentobjekt,
      };
      // Fügt die neue Antwort zu den Antworten dieser Antwort hinzu
      if (!this.reply.replies) {
        this.reply.replies = [];
      }

      this.reply.replies.push(newReply);
      this.reply.expandReplies = true;
      // Setzt das Antwort-Formular zurück
      this.newReply = "";
      this.showReplyForm = false;

      // Wenn die Verschachtelungstiefe 3 erreicht, leite den Benutzer zur gewünschten Seite weiter
      if (this.depth >= 5) {
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
.month {
  font-size: 11px;
  padding-left: 10px;
  border-left: none;
}


.comment-reply {
  border-left: 1px solid #ccc;

  position: static;

  /* Setze die Position auf static */
  .profile-info {
    display: flex;
    align-items: center;
    padding-left: 7px;

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
    padding-left: 2%;
    /* Adjusted padding for nested replies */
  }



  .buttons-container {
    display: flex;
    gap: 18px;
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
    padding-left: 10px;
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