<template>
  <div>
    <h1>conversation</h1>
    <!-- Hier zeigen Sie die Suchergebnisse an -->
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
