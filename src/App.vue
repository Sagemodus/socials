<template>
  <div>
    <router-view/>
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

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Avenir:wght@400;700&display=swap');

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative; /* Positionierung des App-Bereichs */
  min-height: 100vh; /* Mindesthöhe des App-Bereichs */
}

.navbar-fixed {
  position:fixed; /* Positionierung der Navbar */
  bottom: 0; /* Am unteren Rand platzieren */
  left: 0; /* Am linken Rand platzieren */
  width: 100%;
  z-index: 999;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
}

.navbar-fixed a {
  color: #333333;
  text-decoration: none;
  margin-right: 1rem;
}

.navbar-fixed a:hover {
  color: #ff0000;
}

.navbar-fixed .logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-fixed .menu {
  display: flex;
}

.navbar-fixed .menu li {
  list-style: none;
  margin-right: 1rem;
}

.navbar-fixed .menu li:last-child {
  margin-right: 0;
}
</style>
