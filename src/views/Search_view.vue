<template>
  <div class="container">
    <SearchbarComponent @search="performSearch" />
    <SwipeNavigationComponentSuche :onTabSwitch="switchTab" />

    <component :is="currentComponent" :searchResults="filteredResults" />
    <!-- Rest des Templates -->
  </div>
</template>

<script>
import SwipeNavigationComponentSuche from '../components/swipenavigationcomponentsuche.vue';
import SearchbarComponent from '../components/SearchbarComponent.vue';
import PopularComponent from '../components/PopularComponent.vue';
import RecentComponent from '../components/RecentComponent.vue';
import PeopleComponent from '../components/PeopleComponent.vue';
import ConversationComponent from '../components/NotificationConversationComponent.vue';

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
  data() {
    return {
      tabs: [
        { path: '/popular', component: PopularComponent },
        { path: '/recent', component: RecentComponent },
        { path: '/people', component: PeopleComponent },
        { path: '/conversation', component: ConversationComponent },
      ],
      currentTab: '/popular',
      searchResults: [], // Hier werden alle ungefilterten Suchergebnisse gespeichert
    };
  },
  methods: {
    switchTab(path) {
      this.currentTab = path;
      this.performFiltering();
    },
   // performSearch(searchText) {
   /* performSearch(searchText) {
      // Führen Sie Ihre Suchlogik durch und aktualisieren Sie die ungefilterten searchResults basierend auf searchText
      // Beispiel:
      // Rufen Sie Ihre API auf und aktualisieren Sie searchResults mit den Suchergebnissen
    //  this.searchResults = ['result1', 'result2', 'result3']; // Beispielhaftes Update der ungefilterten Suchergebnisse

      // Aktualisieren Sie den aktuellen Tab und rufen Sie performFiltering auf, um die gefilterten Ergebnisse anzuzeigen
      this.currentTab = '/popular'; // Setzen Sie den Tab auf "Popular" am Anfang
      this.performFiltering();
    },
    performFiltering() {
      // Führen Sie die Filterlogik basierend auf dem aktuellen Tab und den ungefilterten searchResults durch
      // Beispiel: Filtern oder sortieren Sie die searchResults basierend auf dem aktuellen Tab
      if (this.currentTab === '/popular') {
        // Filterlogik für den Tab "Popular"
        this.filteredResults = this.searchResults.filter(result => result.category === 'Popular');
      } else if (this.currentTab === '/recent') {
        // Filterlogik für den Tab "Recent"
        this.filteredResults = this.searchResults.filter(result => result.category === 'Recent');
      } else if (this.currentTab === '/people') {
        // Filterlogik für den Tab "People"
        this.filteredResults = this.searchResults.filter(result => result.category === 'People');
      } else if (this.currentTab === '/conversation') {
        // Filterlogik für den Tab "Conversation"
        this.filteredResults = this.searchResults.filter(result => result.category === 'Conversation');
      }
    }
  },
  computed: {
    currentComponent() {
      return this.tabs.find((tab) => tab.path === this.currentTab)?.component;
    }
  },
  created() {
    this.performSearch();
  }
};
</script>
