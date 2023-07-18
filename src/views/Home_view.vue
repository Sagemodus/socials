<template>
  <div class="container">
    <div class="content">
      <!-- Hier kannst du den restlichen Inhalt deiner View hinzufügen -->
    </div>

    <navbar class="navbar-fixed"/>
  </div>
</template>

<script>
import Navbar from '../components/navbar_unten.vue'

export default {
  components: {
    Navbar
  }
}
</script>

<style scoped>


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
