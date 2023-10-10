<template>
  <div class="navigation">
    <div class="tabs" ref="tabsContainer">
      <div class="tabs-inner">
        <div v-for="tab in tabs" :key="tab.path" class="tab" @click="switchTab(tab.path)"
          :class="{ active: activeTab === tab.path }">
          {{ tab.name }}
        </div>
      </div>
    </div>
    <!-- Slots für die verschiedenen Tabs -->
  <slot :name="activeTab.slice(1)"></slot>
  </div>
</template>



<script>
import { ref, reactive, onMounted, computed } from 'vue';
import Hammer from 'hammerjs';
import { iconColor } from './farben'
import { useStore } from 'vuex'; // Importiere das useStore-Hook


export default {
  name: 'SwipeNavigation',
  props: ['onTabSwitch'],
  data() {
    return {
  
    }
  },
  setup(props) {

    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Definiere eine computed-Funktion, um den currentUser aus dem Vuex-Store zu erhalten
    const currentUser = computed(() => store.state.currentUser);

    const tabs = reactive([
      { name: 'Popular', path: '/popular' },
      { name: 'Recent', path: '/recent' },
      { name: 'Users', path: '/people' },
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

    onMounted(() => {
      const el = document;
      const hammer = new Hammer(el);
      hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      hammer.on('swiperight', previousTab);
      hammer.on('swipeleft', nextTab);
  // Setze die Farbe basierend auf dem currentUser
      const userfarbe = currentUser.value.farbe;
      const color = userfarbe ? iconColor(userfarbe) : 'gray';
      document.documentElement.style.setProperty('--iconColor', color);
    });

    return { activeTab, nextTab, previousTab, switchTab, tabs };
  },
};
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: center; /* Center the tabs horizontally */
  overflow-x: auto;
  padding: 10px;
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

@media (max-width: 480px) {
  .tabs {
    flex-wrap: nowrap;
   
    overflow-x: scroll;
  }

  .tabs-inner {
    min-width: fit-content;
    justify-content: flex-start;
  }

  .tab {
    white-space: nowrap;
  }
}
</style>
