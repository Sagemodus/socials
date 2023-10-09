<template>
  <div class="search-bar">
    <input type="text" v-model="searchText" placeholder="Search..." @keyup="searche">
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchText: ''
    };
  },
  methods: {
    searche() {
       console.log("searche method called with:", this.searchText);
      this.$emit('search', this.searchText);
    }
  }
}
</script>
<style lang="scss">
.search-bar {
  height: 15px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
      margin-left: 5px;
      margin-right: 5px;
}

.search-bar input {
  flex: 1;
  padding: 8px;
  border: none;
  background-color: transparent;
  color: #333;
  font-size: 16px;
  outline: none;
}

.search-bar input::placeholder {
  color: #868585;
}



</style>
