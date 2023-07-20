<template>
  <div class="topic-box">
    <img :src="image" alt="Topic image" class="topic-image" />
    <h2 class="topic-title">{{ title }}</h2>
    <p class="topic-text">{{ text }}</p>
    <div class="like-bar">
      <div class="section" v-for="group in sortedGroups"
           :key="group"
           :style="{ width: groupWidths[group] + '%', backgroundColor: groupColors[group] }">
           {{ groupWidths[group] }}%
      </div>
    </div>
    <button @click="like">Like</button>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    likes: {
      type: Object,
      required: true
    }
  },
  computed: {
    totalLikes() {
      return Object.values(this.likes).reduce((sum, value) => sum + value, 0);
    },
    groupWidths() {
      let widths = {};
      for (let group in this.likes) {
        widths[group] = ((this.likes[group] / this.totalLikes) * 100).toFixed(1);
      }
      return widths;
    },
    groupColors() {
      return {
        '-4': 'dodgerblue',
        '-3': 'cornflowerblue',
        '-2': 'deepskyblue',
        '-1': 'skyblue',
        '1': 'gold',
        '2': 'goldenrod',
        '3': 'orange',
        '4': 'red'
      };
    },
    sortedGroups() {
      return ['-4', '-3', '-2', '-1', '1', '2', '3', '4'];
    }
  },
  methods: {
    like() {
      // Hier die entsprechende Logik zum Aktualisieren der Likes hinzufügen
    }
  }
}
</script>
<style scoped>
.topic-box {
  /* Stilisierung der Topic-Box */
}

.topic-image {
  border-radius: 50%; /* macht das Bild rund */
  /* Weitere Stilisierung des Bildes */
}

.topic-title {
  /* Stilisierung des Titels */
}

.topic-text {
  /* Stilisierung des Textes */
}

.like-bar {
  display: flex;
  height: 20px; /* Erhöhe die Höhe, um Platz für die Zahlen zu schaffen */
  align-items: flex-end; /* Ausrichtung am unteren Rand */
}

.section {
  height: 100%;
  position: relative; /* Positionierung für die Zahlen */
}

.section::after {
  content: attr(data-percentage) ; /* Anzeige des Prozentsatzes */
  position: absolute;
  bottom: -20px; /* Platzierung unterhalb des Reglers */
  left: 50%; /* Ausrichtung in der Mitte des Abschnitts */
  transform: translateX(-50%); /* Zentrierung der Zahl */
  font-size: 12px; /* Schriftgröße anpassen */
  color: #000; /* Schriftfarbe anpassen */
}
</style>
