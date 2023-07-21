<template>
  <form @submit.prevent="submitComment" class="comment-form">
    <textarea v-model="newComment" placeholder="Schreibe einen Kommentar..." class="comment-textarea"></textarea>
    <button type="submit" class="comment-button">Kommentar absenden</button>
  </form>
</template>

<script>
export default {
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
  align-items: stretch;

  .comment-textarea {
    resize: none;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #1da1f2;
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
