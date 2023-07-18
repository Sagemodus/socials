<template>
    <div class="container">
      <SwipeNavigationComponentSuche :onTabSwitch="switchTab" />
      <component :is="currentComponent.component" />
      <!-- ... Rest des Templates ... -->
    </div>
  </template>
  
  <script>
  import SwipeNavigationComponentSuche from '../components/swipenavigationcomponentsuche.vue';
  import PopularComponent from '../components/PopularComponent.vue';
  import RecentComponent from '../components/RecentComponent.vue';
  import PeopleComponent from '../components/PeopleComponent.vue';
  import ConversationComponent from '../components/ConversationComponent.vue';
  
  export default {
    name: 'SearchView',
    components: {
      SwipeNavigationComponentSuche,
      PopularComponent,
      RecentComponent,
      PeopleComponent,
      ConversationComponent,
    },
    data() {
      return {
        tabs: [
          { path: '/popular', component: PopularComponent },
          { path: '/recent', component: RecentComponent },
          { path: '/people', component: PeopleComponent },
          { path: '/conversation', component: ConversationComponent },
        ],
        currentTab: '/popular',
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
  
  <!-- ... Restliche Stile ... -->
 