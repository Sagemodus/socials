<template>
  <div>
    <navbar class="navbar-fixed" />
    <div id="app">
      <router-view />
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
body {
  margin: 0;
  padding: 0;
}

#app p {
  font-family: Arial, Helvetica, sans-serif;
}
#app h5{
font-family: Arial, Helvetica, sans-serif;
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

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  margin-bottom: 60px;
  /* Platz für die Navbar reservieren */
}

#app .topic-text {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 16px;



}

#app .comment-text {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 12px;
  margin-bottom: 0px;
  padding-left: 60px;
  padding-right: 10px;
  margin-top: 0%;
  text-align: left;
}

#app .antwort-text {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 12px;
  margin-top: 5px;
  margin-top: 0px;
  padding-left: 8px;

  padding-bottom: 0px;
  margin-bottom: 0px;
  text-align: left;
  padding-top: 5px;
}


#app .conversation-prompt {
  display: flex;
  max-height: 1%;
  text-align: center;
  justify-content: center;
}

/* Restlicher CSS-Code bleibt unverändert */
/* ... */
</style>
