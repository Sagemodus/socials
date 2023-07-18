<template>
  <div class="container">
    <div class="content">
      <!-- Hier kannst du den restlichen Inhalt deiner View hinzufügen -->
    </div>

    <navbar />
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
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Vollständige Höhe des Viewports */
  justify-content: space-between; /* Platz zwischen Inhalt und Navbar */
}

.content {
  flex: 1; /* Füllt den verfügbaren Platz */
  /* Hier kannst du das Layout des restlichen Inhalts anpassen */
}

navbar {
  align-self: flex-end; /* Navbar am unteren Rand ausrichten */
}
</style>
