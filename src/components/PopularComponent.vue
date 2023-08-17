<template>
  <div>
    <p>hallo</p>
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
