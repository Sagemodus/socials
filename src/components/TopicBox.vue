<template>
    <div class="topic-box">
      <img :src="image" alt="Topic image" class="topic-image" />
      <h2 class="topic-title">{{ title }}</h2>
      <p class="topic-text">{{ text }}</p>
      <div class="like-bar">
        <div class="left-section" :style="{ width: sectionWidth.leftWidth }"></div>
        <div class="right-section" :style="{ width: sectionWidth.rightWidth }"></div>
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
      sectionWidth() {
        const leftLikes = this.likes['-4'] + this.likes['-3'] + this.likes['-2'] + this.likes['-1'];
        const rightLikes = this.likes['1'] + this.likes['2'] + this.likes['3'] + this.likes['4'];
        const totalLikes = leftLikes + rightLikes;
  
        if (totalLikes === 0) {
          return {
            leftWidth: '0%',
            rightWidth: '0%'
          };
        } else {
          const leftWidth = ((leftLikes / totalLikes) * 100).toFixed(2) + '%';
          const rightWidth = ((rightLikes / totalLikes) * 100).toFixed(2) + '%';
  
          return {
            leftWidth,
            rightWidth
          };
        }
      }
    },
    methods: {
      like() {
        // Fügen Sie hier die entsprechende Logik zum Aktualisieren der Likes hinzu
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
    position: relative;
    height: 10px;
    background: linear-gradient(to right, red, orange, yellow, lime, aqua, blue, indigo, violet);
  }
  
  .left-section,
  .right-section {
    position: absolute;
    top: 0;
    height: 100%;
  }
  
  .left-section {
    left: 0;
  }
  
  .right-section {
    left: 50%;
  }
  </style>
  