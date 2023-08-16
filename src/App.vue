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
    Navbar,
   
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Avenir:wght@400;700&display=swap');
.nav-bar .nav-link {
  color: iconColor; /* Farbe für die anderen Buttons */
}
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
  height: 50px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 60px; /* Platz für die Navbar reservieren */
}

#app .topic-text{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 14px;
}
#app .comment-text{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 12px;
  margin-bottom: 0px;
  padding-left: 15%;
  padding-right: 5%;
  margin-top: 0%;
  text-align: left;
}
#app .antwort-text{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 12px;
  margin-top: 5px;
    margin-top: 0px;
    padding-left: 15%;
    padding-right: 5%;
    padding-bottom: 0px;
  margin-bottom: 0px;
  text-align: left;
}


#app .conversation-prompt {
  max-height: 1%;
}
/* Restlicher CSS-Code bleibt unverändert */
/* ... */
</style>
