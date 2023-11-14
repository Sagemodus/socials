<template>
  <div class="nav-bar">

    <router-link to="/feed" :key="$route.fullPath" :class="{ 'selected': $route.path === '/feed' }" :style="{ color: $route.path === '/feed' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">

     <span class="material-symbols-outlined">
  home
  </span>

    </router-link>
    <router-link to="/search" :class="{ 'selected': $route.path === '/search' }" :style="{ color: $route.path === '/search' ? 'black' : iconColor(currentUser?.farbe) }" class="nav-link">
     <span class="material-symbols-outlined">
  search
  </span>
    </router-link>

    <router-link to="/notifications" :class="{ 'selected': $route.path === '/notifications' }" :style="{ color: $route.path === '/notifications' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">
      <span class="material-symbols-outlined">
        notifications
        <!-- Badge anzeigen, wenn hasUnreadNotifications true ist -->
        <span v-if="hasUnreadNotifications" class="notification-badge"></span>
      </span>
    </router-link>

    <router-link to="/messages" :class="{ 'selected': $route.path === '/messages' }" :style="{ color: $route.path === '/messages' ? 'black' : iconColor(currentUser.farbe) }" class="nav-link">

  <span class="material-symbols-outlined">
  chat_bubble
  <span v-if="hasUnreadChats" class="notification-badge"></span>
  </span>
    </router-link>
  <router-link :to="`/profil/${currentUserId}`" :class="{ 'selected': $route.path === `/profil/${currentUserId}` }" :style="{ color: $route.path === `/profil/${currentUserId}` ? 'black' : iconColor(currentUser?.farbe) }" class="nav-link">
  <span class="material-symbols-outlined">
  account_circle
  </span>
  </router-link>
  </div>
</template>

<script>
/* eslint-disable */
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { iconColor } from './farben';
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed, ref, watchEffect } from 'vue'; /// Importiere das useStore-Hook

library.add(fas);

export default {
  components: {
    'font-awesome-icon': FontAwesomeIcon,
  },
  setup() {
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    const currentUser = computed(() => store.state.currentUser || {}); // Stellen Sie sicher, dass currentUser ein leeres Objekt ist, wenn nicht vorhanden
    const currentUserId = computed(() => currentUser.value.id || null); // Stellen Sie sicher, dass currentUserId null ist, wenn nicht vorhanden
    const hasUnreadNotifications = ref(false);
    const hasUnreadChats = ref(false);

    watchEffect(() => {
      if (store.state.chats) {
        hasUnreadChats.value = store.state.chats.some(
          (chat) => !chat.read
        );
      } else {
        hasUnreadChats.value = false;
      }

      if (currentUser.value.notifications) {
        hasUnreadNotifications.value = currentUser.value.notifications.some(
          (notification) => !notification.read
        );
      } else {
        hasUnreadNotifications.value = false;
      }
    });

    return {
      iconColor,
      currentUser, // Mache den currentUser verfügbar
      currentUserId,
      hasUnreadNotifications,
      hasUnreadChats
    };
  },
};
</script>

<style scoped>

span.material-symbols-outlined {
    height: 30px;
}
.notification-badge[data-v-451c00f6] {
    display: flex;
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: red;
    border-radius: 50%;
    position: relative;
    top: -30px;
    left: 22px;
}
/* das hier nimmt das verschieben der glocke weg 
span.material-symbols-outlined {
    height: 30px;
}
 */
.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 20;
font-size: 30px;
}



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


