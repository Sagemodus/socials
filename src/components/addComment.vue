<template>
  <form @submit.prevent="submitComment" class="comment-form">
    <textarea v-model="newComment" placeholder="Schreibe einen Kommentar..." class="comment-textarea"></textarea>
    <button 
  type="submit" 
  :style="{ backgroundColor: iconColor(currentUser.farbe) }" 
  class="comment-button"
>
  Kommentar absenden
</button>
  </form>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { mapGetters, mapActions } from 'vuex';
import { iconColor } from './farben'; // Überprüfen Sie bitte den korrekten Pfad
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed } from 'vue'; /// Importiere das computed-Hook

export default {

  setup() {
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);

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
  methods: {
    submitComment() {
      this.$emit('add-comment', this.newComment);
      this.newComment = "";
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .comment-textarea {
    display: flex;
    resize:vertical;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
    transition: border-color 0.3s;
    min-width: 80%;
    height: 10vh;
    &:focus {
      outline: none;
      border-color: #8a8a8a;
    }
  }

  .comment-button {
    background-color: #1da1f2;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0c85d0;
    }
  }
}
</style>
