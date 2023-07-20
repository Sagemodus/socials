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
import { reactive, computed } from 'vue';

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
  setup(props) {
    const state = reactive({
      groupColors: {
        '-4': 'dodgerblue',
        '-3': 'cornflowerblue',
        '-2': 'deepskyblue',
        '-1': 'skyblue',
        '1': 'gold',
        '2': 'goldenrod',
        '3': 'orange',
        '4': 'red'
      }
    });

    const totalLikes = computed(() =>
      Object.values(props.likes).reduce((sum, value) => sum + value, 0)
    );

    const groupWidths = computed(() => {
      const widths = {};
      for (const group in props.likes) {
        widths[group] = ((props.likes[group] / totalLikes.value) * 100).toFixed(1);
      }
      return widths;
    });

    const sortedGroups = ['-4', '-3', '-2', '-1', '1', '2', '3', '4'];

    const like = () => {
      // Update likes logic here
    };

    return {
      ...state,
      totalLikes,
      groupWidths,
      sortedGroups,
      like
    };
  }
}
</script>

<style scoped>
  /* Styles here */
</style>
