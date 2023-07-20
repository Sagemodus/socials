<template>
  <div>
    <div class="sticky-tab-bar" :class="{ 'sticky': isTabBarSticky, 'scrolled': isScrolled }">
      <SwipeNavigationComponent :onTabSwitch="switchTab" />
    </div>
    <component :is="currentComponent.component" />
    <!-- ... Rest des Templates ... -->
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import PublicComponent from '../components/PublicComponent.vue';
import FAndFComponent from '../components/FAndFComponent.vue';
import CommunityComponent from '../components/CommunityComponent.vue';
import SwipeNavigationComponent from '../components/SwipeNavigationComponent.vue';

export default {
  name: 'FeedView',
  components: {
    SwipeNavigationComponent,
    PublicComponent,
    FAndFComponent,
    CommunityComponent,
  },

  setup() {
    const tabs = [
      { path: '/public', component: PublicComponent },
      { path: '/fandf', component: FAndFComponent },
      { path: '/community', component: CommunityComponent },
    ];
    const currentTab = ref('/public');
    const currentComponent = ref(tabs.find((tab) => tab.path === currentTab.value));
    const lastScrollPosition = ref(0);
    const isTabBarSticky = ref(false);
    const isScrolled = ref(false); // Neu hinzugefügt

    const switchTab = (path) => {
      currentTab.value = path;
      currentComponent.value = tabs.find((tab) => tab.path === path);
    };

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      isTabBarSticky.value = scrollPosition < lastScrollPosition.value; // Überprüfe die Scroll-Richtung
      lastScrollPosition.value = scrollPosition; // Aktualisiere die letzte Scroll-Position
      isScrolled.value = scrollPosition > 0; // Neu hinzugefügt
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      currentTab,
      currentComponent,
      isTabBarSticky,
      isScrolled, // Neu hinzugefügt
      switchTab,
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
