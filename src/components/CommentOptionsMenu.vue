<template>
    <div class="comment-options-menu">
      <button @click="blockUser">Block User</button>
      <!-- Other options can be added here -->
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      blockUser() {
        // Call a method to block the user (You can implement this functionality)
        this.$store.dispatch('blockUser', this.userIdToBlock);
      },
      // Other option methods can be added here
    },
  };
  </script>
  
  <style scoped>
  /* Add CSS styling for your menu */
  .comment-options-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    padding: 5px;
    z-index: 1;
  }
  </style>