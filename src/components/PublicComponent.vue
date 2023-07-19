<template>
  <div>
    <h1>public</h1>
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
