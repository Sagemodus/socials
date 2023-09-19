<template>
  <div class="nav-bar">
    <router-link to="/feed" :class="{ 'selected': $route.path === '/feed' }" :style="{ color: $route.path === '/feed' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'home']" class="icon"/>
    </router-link>
    <router-link to="/search" :class="{ 'selected': $route.path === '/search' }" :style="{ color: $route.path === '/search' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'search']" class="icon"/>
    </router-link>
    <router-link to="/notifications" :class="{ 'selected': $route.path === '/notifications' }" :style="{ color: $route.path === '/notifications' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'bell']" class="icon"/>
    </router-link>
    <router-link to="/messages" :class="{ 'selected': $route.path === '/messages' }" :style="{ color: $route.path === '/messages' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'envelope']" class="icon"/>
    </router-link>
  <router-link :to="`/profil/${currentUserId}`" :class="{ 'selected': $route.path === `/profil/${currentUserId}` }" :style="{ color: $route.path === `/profil/${currentUserId}` ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">
    <font-awesome-icon :icon="['fas', 'user']" class="icon"/>
  </router-link>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { iconColor } from './farben';
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed } from 'vue'; /// Importiere das useStore-Hook

library.add(fas);

export default {
  components: {
    'font-awesome-icon': FontAwesomeIcon,
  },
  setup() {
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);
    const currentUserId = computed(() => store.state.currentUser.id);

    return {
      iconColor,
      currentUser, // Mache den currentUser verfügbar
      currentUserId
    };
  },
};
</script>

<style scoped>
.nav-bar {
  display: flex;
  justify-content: space-evenly;
}

.icon {
  font-size: 24px;  
  margin: 0 20px;
  text-decoration: none;
}

.selected {
  color: black;
}

.nav-link {
  color: iconColor; /* Farbe für die anderen Buttons */
}

ul {
  padding-inline-start: 0;
}

li {
  list-style: none;
}




</style>


