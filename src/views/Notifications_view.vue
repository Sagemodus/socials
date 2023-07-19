<template>
    <div class="container">
      <SwipeComponentNotification :onTabSwitch="switchTab" />
      <component :is="currentComponent.component" />
      <!-- ... Rest des Templates ... -->
    </div>
</template>
  
<script>
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
  data() {
    return {
      tabs: [
        { path: '/all', component: AllComponent },
        { path: '/mentions', component: MentionComponent }, // geändert auf /mentions
        { path: '/notification-conversation', component: ConversationComponent }, // bleibt unverändert
      ],
      currentTab: '/all',
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
