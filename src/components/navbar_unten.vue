<template>
  <div class="nav-bar">
    <router-link to="/feed" :class="{ 'selected': $route.path === '/feed' }" :style="{ color: $route.path === '/feed' ? 'black' : iconColor }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'home']" class="icon"/>
    </router-link>
    <router-link to="/search" :class="{ 'selected': $route.path === '/search' }" :style="{ color: $route.path === '/search' ? 'black' : iconColor }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'search']" class="icon"/>
    </router-link>
    <router-link to="/notifications" :class="{ 'selected': $route.path === '/notifications' }" :style="{ color: $route.path === '/notifications' ? 'black' : iconColor }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'bell']" class="icon"/>
    </router-link>
    <router-link to="/messages" :class="{ 'selected': $route.path === '/messages' }" :style="{ color: $route.path === '/messages' ? 'black' : iconColor }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'envelope']" class="icon"/>
    </router-link>
    <router-link to="/profile" :class="{ 'selected': $route.path === '/profile' }" :style="{ color: $route.path === '/profile' ? 'black' : iconColor }" class="nav-link">
      <font-awesome-icon :icon="['fas', 'user']" class="icon"/>
    </router-link>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { iconColor } from './farben'

library.add(fas)

export default {
  components: {
    'font-awesome-icon': FontAwesomeIcon
  },
  setup() {
    return {
      iconColor
    };
  }
}
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

<meta name="viewport" content="width=device-width, initial-scale=1.0">
