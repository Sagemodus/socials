<template>
  <div>
    <div class="sticky-tab-bar" :class="{ 'sticky': isTabBarSticky, 'scrolled': isScrolled }">
      <SwipeComponentNotification :onTabSwitch="switchTab" />
    </div>
    <component :is="currentComponent.component" />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import SwipeComponentNotification from '../components/SwipeComponentNotification.vue';
import AllComponent from '../components/AllComponent.vue';
import MentionComponent from '../components/MentionsComponent.vue';
import ConversationComponent from '../components/ConversationComponent.vue';

export default {
  name: 'NotificationsView',
  components: {
    SwipeComponentNotification,
    AllComponent,
    MentionComponent,
    ConversationComponent,
  },
  setup() {
    const tabs = [
      { path: '/all', component: AllComponent },
      { path: '/mentions', component: MentionComponent },
      { path: '/notification-conversation', component: ConversationComponent },
    ];
    const currentTab = ref('/all');
    const currentComponent = ref(tabs.find((tab) => tab.path === currentTab.value));
    const lastScrollPosition = ref(0);
    const isTabBarSticky = ref(false);
    const isScrolled = ref(false);

    const switchTab = (path) => {
      currentTab.value = path;
      currentComponent.value = tabs.find((tab) => tab.path === path);
    };

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      isTabBarSticky.value = scrollPosition < lastScrollPosition.value;
      lastScrollPosition.value = scrollPosition;
      isScrolled.value = scrollPosition > 0;
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
      isScrolled,
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
