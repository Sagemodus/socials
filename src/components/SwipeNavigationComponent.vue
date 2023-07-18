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
  
  export default {
    name: 'SwipeNavigation',
    props: ['onTabSwitch'],
    setup(props) {
      const tabs = reactive([
        { name: 'Public', path: '/public' },
        { name: 'F&F', path: '/fandf' },
        { name: 'Community', path: '/community' },
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
}
,
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
  background-color: blue;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.tab.active {
  color: blue;
}

.tab.active::after {
  transform: scaleX(1);
}
</style>
