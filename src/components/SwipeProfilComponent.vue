<template>
  <div class="swipe-navigation">
    <div class="tabs" ref="tabsContainer">
      <div class="tabs-inner">
        <div
          v-for="tab in tabs"
          :key="tab.path"
          class="tab"
          @click="switchTab(tab.path)"
          :class="{ active: activeTab === tab.path }"
        >
          {{ tab.name }}
        </div>
      </div>
    </div>
    <div class="content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>
  

<script>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import Hammer from 'hammerjs';
import { useStore } from 'vuex';

export default {
  setup(props) {
    const store = useStore();
     // eslint-disable-next-line
    const currentUser = computed(() => store.state.currentUser);

    const tabs = reactive([
      { name: 'Comments', path: 'comments' },
      { name: 'Replies', path: 'replies' },
      { name: 'Votes', path: 'votes' },
    ]);

    // Versuche, das aktive Tab aus dem Session Storage zu laden oder setze das erste Tab als Standard
    const activeTab = ref(sessionStorage.getItem('activeTab') || tabs[0].path);

    const switchTab = (path) => {
      activeTab.value = path;
      sessionStorage.setItem('activeTab', path); // Speichere das aktive Tab im Session Storage
      if (typeof props.onTabSwitch === 'function') {
        props.onTabSwitch(path);
      }
    };

    const switchToTabByIndex = (index) => {
      if (index < 0 || index >= tabs.length) return;
      switchTab(tabs[index].path);
    };

    const nextTab = () => {
      const currentIndex = tabs.findIndex((tab) => tab.path === activeTab.value);
      switchToTabByIndex(currentIndex + 1);
    };

    const previousTab = () => {
      const currentIndex = tabs.findIndex((tab) => tab.path === activeTab.value);
      switchToTabByIndex(currentIndex - 1);
    };

    let hammer;
    onMounted(() => {
      const el = document;
      hammer = new Hammer(el);
      hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      hammer.on('swiperight', () => {
        previousTab();
      });
      hammer.on('swipeleft', () => {
        nextTab();
      });
    });

    onUnmounted(() => {
      if (hammer) {
        hammer.off('swiperight');
        hammer.off('swipeleft');
        hammer.destroy();
        hammer = null;
      }
    });

    // Setze die Farbe basierend auf dem currentUser


    return { activeTab, nextTab, previousTab, switchTab, tabs };
  },
};
</script>
  
  <style scoped>
  .swipe-navigation {
    display: flex;
    flex-direction: column;
  }
  
  .tabs {
    display: flex;
    justify-content: center;
    background: #ffffff;
  }
  
  .tabs-inner {
    display: flex;
    gap: 20px;
    min-width: 100%;
    justify-content:space-evenly; /* Ensure equal spacing between tabs */
  }
  
  .tab {
    padding: 10px 20px;
    font-size: 16px;
    color: #333;
    text-align: center;
    flex-shrink: 0;
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
    color: var(--iconColor);
  }
  
  .tab.active::after {
    transform: scaleX(1);
  }
  
  
  </style>
  