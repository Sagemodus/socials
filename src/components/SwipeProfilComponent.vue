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
        <slot name="replies"></slot>
        <slot name="likes"></slot>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted, computed } from 'vue';
  import Hammer from 'hammerjs';
  import { iconColor } from './farben'
  import { useStore } from 'vuex';
  
  export default {
    name: 'SwipeProfilComponent',
    props: {
      onTabSwitch: {
        type: Function,
        required: true
      }
    },
    data() {
      return {
        iconColor
      }
    },
    setup(props) {
      const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Definiere eine computed-Funktion, um den currentUser aus dem Vuex-Store zu erhalten
    const currentUser = computed(() => store.state.currentUser);
      const tabs = reactive([
        { name: 'Replies', path: 'replies' },
        { name: 'Likes', path: 'likes' },
      ]);
  
      const activeTab = ref(tabs[0].path);
  
      const switchTab = (path) => {
        activeTab.value = path;
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
  
      onMounted(() => {
        const el = document;
        const hammer = new Hammer(el);
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        hammer.on('swiperight', previousTab);
        hammer.on('swipeleft', nextTab);
       // Setze die Farbe basierend auf dem currentUser
      const userParty = currentUser.value.party;
      const color = userParty ? iconColor(userParty) : 'gray';
      document.documentElement.style.setProperty('--iconColor', color);
      });
  
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
  