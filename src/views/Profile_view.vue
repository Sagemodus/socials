<template>
    <div>
      <SwipeProfilComponent @onTabSwitch="handleTabSwitch">
        <template #replies>
          <!-- Inhalte für den "Replies"-Tab -->
          <div v-show="activeTab === 'replies'">
            <h2>Replies</h2>
            <!-- Weitere Inhalte für den "Replies"-Tab hier -->
          </div>
        </template>
        <template #likes>
          <!-- Inhalte für den "Likes"-Tab -->
          <div v-show="activeTab === 'likes'">
            <h2>Likes</h2>
            <!-- Weitere Inhalte für den "Likes"-Tab hier -->
          </div>
        </template>
      </SwipeProfilComponent>
    </div>
  </template>
 <script>
 import SwipeProfilComponent from '../components/SwipeProfilComponent.vue';
 
 export default {
   name: 'ProfileView',
   components: {
     SwipeProfilComponent,
   },
   data() {
     return {
       activeTab: 'replies',
     };
   },
   methods: {
     handleTabSwitch(path) {
       this.activeTab = path;
     },
   },
 };
 </script>
 