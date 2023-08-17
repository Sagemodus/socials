<template>
  <div>
    <div v-if="selectedComment">
      <div class="single-comment top-comment">
        <CommentReply :reply="selectedComment" :depth="0" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommentReply from './CommentReply.vue';

export default {
  components: {
    CommentReply,
  },
  computed: {
    ...mapGetters(['getCommentById']),
    selectedComment() {
      const commentId = this.$route.params.commentId;
      const comment = this.getCommentById(commentId);
      return comment;
    },
  },
};
</script>

<style lang="scss" scoped>
.top-comment {
  /* Hier können Sie den speziellen Stil für das oberste Kommentar definieren. */
  width: 80%;
  margin: 0 auto;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
}

</style>
