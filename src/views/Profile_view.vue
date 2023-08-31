<template>
  <settingsComponent />
</template>

<script>
import { useStore } from 'vuex'; 
import { computed } from 'vue'; 
import { iconColor } from '../components/farben';
import settingsComponent from '../components/profilebutton/settingsComponent.vue';

export default {
  setup() {
    const store = useStore();
    const currentUser = computed(() => store.state.currentUser);

    return {
      iconColor,
      currentUser,
    
    };
  },
  components: {
    settingsComponent,
  },
};
</script>
