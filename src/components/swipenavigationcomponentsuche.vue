<template>
    <div class="navigation">
      <div class="tabs">
        <div v-for="tab in tabs" :key="tab.path" class="tab" @click="switchTab(tab.path)" :class="{ active: activeTab === tab.path }">
          {{ tab.name }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from 'vue';
  import Hammer from 'hammerjs';
  import { iconColor } from './farben'
  
  export default {
    name: 'SwipeNavigation',
    props: ['onTabSwitch'],
    data() {
      return {
        iconColor
      }
    },
    setup(props) {
      const tabs = reactive([
        { name: 'Popular', path: '/popular' },
        { name: 'Recent', path: '/recent' },
        { name: 'People', path: '/people' },
        { name: 'Conversation', path: '/conversation' },
      ]);
  
      const activeTab = ref(tabs[0].path);
  
      const tabIndexes = tabs.reduce((acc, tab, i) => ({ ...acc, [tab.path]: i }), {});
  
      const switchTab = (path) => {
        activeTab.value = path;
        props.onTabSwitch(path);
      };
  
      const switchToTabByIndex = (index) => {
        if (index < 0 || index >= tabs.length) return;
        switchTab(tabs[index].path);
      };
  
      const nextTab = () => {
        const currentIndex = tabIndexes[activeTab.value];
        switchToTabByIndex(currentIndex + 1);
      };
  
      const previousTab = () => {
        const currentIndex = tabIndexes[activeTab.value];
        switchToTabByIndex(currentIndex - 1);
      };
  
      return { activeTab, nextTab, previousTab, switchTab, tabs };
    },
    mounted() {
      const el = document;
      const hammer = new Hammer(el);
      hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      hammer.on('swiperight', this.previousTab);
      hammer.on('swipeleft', this.nextTab);
      document.documentElement.style.setProperty('--iconColor', this.iconColor);
    },
  };
  </script>
  
  <style scoped>
  .tabs {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 10px;
    background: #ffffff;
  }
  
  .tab {
    padding: 10px 20px;
    font-size: 16px;
    color: #333;
    text-align: center;
    flex-grow: 1;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .tab::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--iconColor);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  .tab.active {
    color:var(--iconColor) ;
  }
  
  .tab.active::after {
    transform: scaleX(1);
  }
  </style>
  