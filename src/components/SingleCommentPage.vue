//SingleCommentPage.vue
<template>
  <div>

  <!-- Use selectedComment.commentID -->
    <div v-if="selectedComment">
      <div class="single-comment">
        <CommentBox :comment="selectedComment" />
      </div>

    </div>
    </div>
</template>

<script>
import { mapGetters, mapActions} from 'vuex';
import CommentBox from './CommentBox';
import CommentReply from './CommentReply';
import { v4 as uuidv4 } from 'uuid';



export default {
  components: {
    CommentBox,
    CommentReply,
  },
  computed: {
    ...mapGetters(['getCommentById']),
    selectedComment() {
  const commentId = this.$route.params.commentId;
  const comment = this.getCommentById(commentId);
  console.log('Die ID '+ commentId + 'wurde gefunden');
  console.log(comment);

  if (comment === !null) {  // Prüfe, ob comment gleich null ist
    console.log(comment);
  }
  else{
    console.log(comment); // Hier wird die Ausgabe im Konsolenfenster angezeigt
  }
  return comment;
},
  },

  data() {
    return {
      maxDisplayedReplies: 3, // Maximale Anzahl der anzuzeigenden Antworten
    };
  },
  methods: {
    ...mapActions(['addReplyToComment']),
    // Beispiel, wie Sie die Action aufrufen könnten, um eine Antwort hinzuzufügen
    addReplyToCommentHandler() {
      // Dynamische Extraktion der commentId aus der aktuellen Route
      const commentId = this.$route.params.commentId;
      const reply = { text: 'Eine neue Antwort' }; // Beispiel-Antwort
      reply.id = uuidv4(); // Hier wird die ID für die Antwort mit uuidv4() erstellt
      this.addReplyToComment({ commentId, reply });
    }
  },
  mounted() {
  this.maxDisplayedReplies = this.$route.query.maxDisplayedReplies || 3;
},
};
</script>

<style lang="scss" scoped>
/* Styles für SingleCommentPage.vue */
</style>
