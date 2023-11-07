<template>
  <div>
<div class="header">
   <button class="zurück-button" @click="$router.go(-1)"> <font-awesome-icon :icon="['fas', 'arrow-left']"
        size="lg" /></button>
</div>
   



    <div v-if="selectedComment">
      <div class="main-container">

             <div class="single-comment top-comment">
        <CommentReply :reply="selectedComment" :isSinglePage="true" :depth="0" />
      </div> 
      </div>

    </div>
  </div>
</template>

<script>

import CommentReply from './CommentReply.vue';
import { useStore } from 'vuex'
import { useRoute } from 'vue-router';
import { computed, watch, ref } from 'vue';
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
.header {
    height: 35px;
    display: flex;
    flex-direction: row;
    align-items: center;
}
button.zurück-button {
    padding-left: 10px;
  display: flex;
  position: sticky;
  background-color: transparent;
  border: none;
      padding-left: 10px;
}
</style>
