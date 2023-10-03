<template>
  <div class="container">
   
    <div class="sticky-tab-bar" :class="{ 'sticky': isTabBarSticky, 'scrolled': isScrolled }">
       <SearchbarComponent @search="performSearch" />
      <SwipeNavigationComponentSuche :onTabSwitch="switchTab" />
    </div>
    <component :is="currentComponent" :searchResults="filteredResults" />
    <!-- Rest des Templates -->
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import SwipeNavigationComponentSuche from '../components/swipenavigationcomponentsuche.vue';
import SearchbarComponent from '../components/SearchbarComponent.vue';
import PopularComponent from '../components/PopularComponent.vue';
import RecentComponent from '../components/RecentComponent.vue';
import PeopleComponent from '../components/PeopleComponent.vue';
import ConversationComponent from '../components/ConversationComponent.vue'


export default {
  name: 'SearchView',
  components: {
    SwipeNavigationComponentSuche,
    SearchbarComponent,
    PopularComponent,
    RecentComponent,
    PeopleComponent,
    ConversationComponent,
  
  },
  setup() {
    const tabs = [
      { path: '/popular', component: PopularComponent },
      { path: '/recent', component: RecentComponent },
      { path: '/people', component: PeopleComponent },
      { path: '/conversation', component: ConversationComponent },

    ];
    const currentTab = shallowRef('/popular');
    const searchResults = shallowRef([]); 
    const lastScrollPosition = shallowRef(0);
    const isTabBarSticky = shallowRef(false);
    const isScrolled = shallowRef(false);
    

    const switchTab = (path) => {
  currentTab.value = path;
  currentComponent.value = tabs.find((tab) => tab.path === path).component;
  performFiltering();

};
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      isTabBarSticky.value = scrollPosition < lastScrollPosition.value;
      lastScrollPosition.value = scrollPosition;
      isScrolled.value = scrollPosition > 0;
    };

    const performFiltering = () => {
      // Führen Sie die Filterlogik basierend auf dem aktuellen Tab und den ungefilterten searchResults durch
    }
    const currentComponent = ref(tabs.find((tab) => tab.path === currentTab.value).component);



    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
    });


    return {
      currentTab,
      searchResults,
      isTabBarSticky,
      isScrolled,
      switchTab,
      currentComponent,  // Hinzufügen der currentComponent Eigenschaft
    };
  },
};
</script>

<style lang="scss">
.sticky-tab-bar {
  position: relative;
  z-index: 999;
  transition: transform 0.3s ease-in-out;

  &.scrolled {
    transform: translateY(-100%);
  }

  &.sticky {
    position: sticky;
    top: 0;
    transform: translateY(0);
  }
}
</style>
