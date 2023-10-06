<template>
  <div>
    <div v-if="selectedComment">
      <div class="single-comment top-comment">
        <CommentReply :reply="selectedComment"  />
      </div>
    </div>
  </div>
</template>

<script>
import { onBeforeUnmount  } from 'vue';
import CommentReply from './CommentReply.vue';
import {useStore} from 'vuex'
import { useRoute } from 'vue-router';
import { computed, watch,ref } from 'vue';
 export default {
  components: {
    CommentReply,
  },

  setup() {
    const store = useStore();
    const route = useRoute();
   
    let commentId = ref(route.params.commentId);
   let selectedComment = computed(() => store.getters.getCommentById(commentId.value));



  


    watch(route, () => {
    commentId.value = route.params.commentId; // Aktualisieren Sie .value hier
     
     
    });

    return {
      selectedComment,
     route,
    }


  

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
