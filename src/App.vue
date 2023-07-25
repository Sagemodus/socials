<template>
  <div>
    <navbar class="navbar-fixed"/>
    <div id="app">
      <router-view/>
    </div>
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

body {
  margin: 0;
  padding: 0;
}

.navbar-fixed {
  position: fixed;
  bottom: 0;
  
  width: 100%;
  z-index: 999;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 60px; /* Platz für die Navbar reservieren */
}

#app .antwort-text {
  text-align: left;
  padding-left: 40px;
  padding-bottom: 0px;
  margin-bottom: 16px;
  margin-top: 0px;
} 
/* Restlicher CSS-Code bleibt unverändert */
/* ... */
</style>
