<template>
  <div>
    <div class="author-info" @click="selectuser">
      <img :src="user.profileImage" alt="Author Profile Image" class="author-image" />
      <span class="author-name">{{ user.name }}</span>
      <slot></slot>

    </div>
  </div>
</template>

<script lang="js">
// eslint-disable-next-line no-unused-vars
import { useStore } from 'vuex';
// eslint-disable-next-line no-unused-vars
import { computed } from 'vue';

export default {
  props: {
    user: Object,
  },

  setup(props, { emit }) {
    const selectuser = () => {
      console.log(" selected")
      emit('select-user', props.user) // Senden Sie das gesamte Benutzerobjekt

    }

    return {
      selectuser
    };
  }
};
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
}

.author-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* Rundes Profilbild */
  margin-right: 10px;
  object-fit: cover;
  /* Damit das Bild nicht verzerrt wird */
}

.author-name {
    font-weight: bold;
    color: #262626;
    overflow: hidden;
    min-width: 80%;
    text-align: left;
}</style>
