<template>
    <div>
      <h1>Conversation</h1>
      <div v-for="result in searchResults" :key="result.id">
        <!-- Display your search results here -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['searchResults']
  };
  </script>
  