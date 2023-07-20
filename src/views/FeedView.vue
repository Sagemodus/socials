<template>
  <div class="container">
    <SwipeNavigationComponent :onTabSwitch="switchTab" />
    <component :is="currentComponent.component" />
    <!-- ... Rest des Templates ... -->
  </div>
</template>

<script>
import Navbar from '../components/navbar_unten.vue';
import PublicComponent from '../components/PublicComponent.vue';
import FAndFComponent from '../components/FAndFComponent.vue';
import CommunityComponent from '../components/CommunityComponent.vue';
import SwipeNavigationComponent from '../components/SwipeNavigationComponent.vue';

export default {
  name: 'FeedView',
  components: {
    Navbar,
    SwipeNavigationComponent,
    PublicComponent,
    FAndFComponent,
    CommunityComponent,
  },
  data() {
    return {
      tabs: [
        { path: '/public', component: PublicComponent },
        { path: '/fandf', component: FAndFComponent },
        { path: '/community', component: CommunityComponent },
      ],
      currentTab: '/public',
      currentComponent: { path: '/public', component: PublicComponent },
    };
  },
  methods: {
    switchTab(path) {
      this.currentTab = path;
      this.currentComponent = this.tabs.find((tab) => tab.path === path);
    },
  },
};
</script>

<!-- ... Restliche Stile ... -->
