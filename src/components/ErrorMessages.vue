<template>
  <div v-if="errors.length" class="error-messages">
    <div v-for="(error, index) in errors" :key="index" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    errors: Array,
  },
};
</script>

<style scoped>
.error-messages {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 999;
}

.error-message {
  margin-bottom: 5px;
}
</style>
