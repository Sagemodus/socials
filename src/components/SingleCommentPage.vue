//SingleCommentPage.vue
<template>
  <div>

  <!-- Use selectedComment.commentID -->
    <div v-if="selectedComment">
      <div v-if="selectedComment" class="single-comment top-comment">
  <CommentBox :comment="selectedComment" />
</div>

    </div>
    </div>
</template>

<script>
import { mapGetters, mapActions} from 'vuex';
import CommentBox from './CommentBox';
import { v4 as uuidv4 } from 'uuid';



export default {
  components: {
    CommentBox,

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
.top-comment {
  /* Hier können Sie den speziellen Stil für das oberste Kommentar definieren. 
     Sie können die gleichen Stile wie für die Themen verwenden. */
  
  width: 80%; /* Zum Beispiel, Sie können die Breite anpassen. */
  margin: 0 auto; /* Zentriert das Element horizontal */
  background-color: #f0f0f0; /* Sie können auch die Hintergrundfarbe ändern. */
  border-radius: 10px; /* Runden Sie die Ecken ab, um ein moderneres Aussehen zu erzeugen. */
  padding: 20px; /* Fügen Sie Innenabstand hinzu, um den Text vom Rand des Elements zu trennen. */
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1); /* Fügen Sie einen Schatten hinzu, um Tiefe zu erzeugen. */
}

</style>
