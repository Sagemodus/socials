<template>
    <div class="topic-page">
      <h1>{{ topic.title }}</h1>
      <div class="topic-details">
        <img :src="topic.image" alt="Topic image" class="topic-image" />
        <p class="topic-text">{{ topic.text }}</p>
      </div>
      <div class="topic-likes">
        <h2>Likes</h2>
        <div class="like-group" v-for="(count, group) in topic.likes" :key="group">
          <div class="like-group-title">Group {{ group }}</div>
          <div class="like-count">{{ count }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>

  
  export default {
    props: {
      id: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        topic: null,
      };
    },
   
  };
  </script>
  
  <style scoped>
  /* Styles hier */
  </style>
  