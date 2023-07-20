<template>
  <div>
    <h1>People</h1>
    <div>
      <input type="text" v-model="filter" placeholder="Filter...">
    </div>
    <div v-for="result in filteredResults" :key="result.id">
      <!-- Display your filtered search results here -->
    </div>
  </div>
</template>

<script>


export default {
  props: ['searchResults'],
  data() {
    return {
      filter: ''
    };
  },
  computed: {
    filteredResults() {
      
      if (!this.filter) {
        return this.searchResults;
      }

      return this.searchResults.filter(result => {
        // Apply your filter logic here
        // For example, if you want to filter by name:
        return result.name.toLowerCase().includes(this.filter.toLowerCase());
      });
    }
  }
};
</script>
