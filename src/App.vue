<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/login">login</router-link>
  </nav>
  <router-view/>
  <div class="container">
    <div class="content">
      <!-- Hier kannst du den restlichen Inhalt deiner View hinzufügen -->
    </div>

    <navbar class="navbar-fixed"/>
  </div>
</template>


<script>
import Navbar from './components/navbar_unten.vue'

export default {
  components: {
    Navbar
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.navbar-fixed {
  position: fixed;
  bottom: 0.5cm;  /* 1 cm Abstand vom unteren Rand */
  right: 0;  /* Abstand von rechts auf 0 setzen */
  width: 100%;  /* volle Breite */
  z-index: 999; /* Damit die Navbar über anderen Elementen liegt */
}
.container {
  height: 999px;
}
</style>
