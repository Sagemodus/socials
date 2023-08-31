<!--addComment.vue-->
<template>
  <form @submit.prevent="submitComment" class="comment-form">
    <div class="comment-input-container">
      <div class="textarea-container">
        <textarea
          v-model="newComment"
          placeholder="Schreibe einen Kommentar..."
          rows="1"
          class="comment-textarea"
          ref="textarea"
        ></textarea>
      </div>
      <button
        type="submit"
        :style="{ color: iconColor(currentUser.farbe)}"
        class="comment-button"
      >
        <font-awesome-icon :icon="['fas', 'paper-plane']" />
      </button>
    </div>
  </form>
</template>


<script>

import { iconColor } from './farben'; // Überprüfen Sie bitte den korrekten Pfad
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed } from 'vue'; /// Importiere das computed-Hook
import autosize from 'autosize';
export default {

  setup() {
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);

 // Automatisches Anpassen der Textarea-Zeilen


    return {
      iconColor,
      currentUser, // Mache den currentUser verfügbar
    
    };
  },

  data() {
    return {
      newComment: "",
    };
  },
  mounted() {
  autosize(this.$refs.textarea);
},
  methods: {
 
    submitComment() {
    this.$emit('add-comment', this.newComment);
    this.newComment = "";
  },
  
  },
};
</script>

<style lang="scss">
.textarea-container {
  max-height: 100%;
  overflow: hidden;
  flex: 1;
  padding: 10px;
}
.comment-textarea {
  resize: vertical;

}
.comment-input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 30px;
  padding: 8px;
  position: fixed;
  bottom: 55px;
 left: 0;
 right:0;
 background-color: white;
 align-items: center;

}

.comment-textarea {
  max-height: 200px;
width: 100%;
  border: none;

  resize: none;
}

.comment-button {
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 20px;
}
</style>
