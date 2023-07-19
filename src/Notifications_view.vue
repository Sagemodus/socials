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
  import FandFComponent from '../components/FAndFComponent.vue';
  import CommunityComponent from '../components/CommunityComponent.vue';
  import SwipeNavigationComponent from '../components/SwipeNavigationComponent.vue';
  
  export default {
    name: 'FeedView',
    components: {
      Navbar,
      SwipeNavigationComponent,
      PublicComponent,
      FandFComponent,
      CommunityComponent,
    },
    data() {
      return {
        tabs: [
          { path: '/public', component: PublicComponent },
          { path: '/fandf', component: FandFComponent },
          { path: '/community', component: CommunityComponent },
        ],
        currentTab: '/public',
        currentComponent: null,
      };
    },
    created() {
      this.switchTab(this.currentTab);
    },
    methods: {
      switchTab(path) {
        this.currentTab = path;
        this.currentComponent = this.tabs.find((tab) => tab.path === path);
      },
    },
  };
  </script>