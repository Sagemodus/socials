<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <button class="modal-close" @click="closeModal">
        <font-awesome-icon :icon="['fas', 'arrow-left']"  />
      </button>
      <div class="modal-content">
        <!-- Modal-Inhalt -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  position: relative;
  width: 70%;
  max-width: 400px;
  padding: 2rem;
}

.modal-close[data-v-11004ad0][data-v-11004ad0] {
    left: -10px;
    position: absolute;
    top: -10px;
    /* right: 0; */
    margin: 1rem;
    cursor: pointer;
    font-size: 1.5rem;
    background-color: transparent;
    border: none;
}
.modal-content {
  text-align: center;
}

/* Passen Sie das Styling nach Bedarf an */
</style>
