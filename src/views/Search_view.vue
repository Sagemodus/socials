<template>
  <div class="container">
    <div class="sticky-tab-bar" :class="{ 'sticky': isTabBarSticky, 'scrolled': isScrolled }">
      <SearchbarComponent @search="performSearch" />
      <SwipeNavigationComponentSuche v-if="showTabs" :onTabSwitch="switchTab">
        <template #popular>

          <TopicBox v-for="topic in searchResults?.popular" :key="topic.id" :id="topic.id" />

        </template>
        <template #recent>
          <TopicBox v-for="topic in searchResults?.recent" :key="topic.id" :id="topic.id" />
        </template>
        <template #people>
          <div class="profil-anzeige">

            <div v-for="user in searchResults.people" :key="user.id" :id="user?.id" class="profil-inhalt">
              <img :src="user.profileImage" alt="Profilbild" class="profile-image" @click="goToProfile(user.id)">
              <h4> {{ user.name }} </h4>

            </div>

          </div>
        </template>
      </SwipeNavigationComponentSuche>
    </div>
    <!-- Rest des Templates -->
  </div>
</template>
<script>
import { ref, shallowRef, computed } from 'vue';
import SwipeNavigationComponentSuche from '../components/swipenavigationcomponentsuche.vue';
import SearchbarComponent from '../components/SearchbarComponent.vue';

import TopicBox from '../components/TopicBox.vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'SearchView',
  components: {
    SwipeNavigationComponentSuche,
    SearchbarComponent,
    TopicBox,

  },
  setup() {
    const store = useStore();
    const topics = store.state.topics;
    const users = store.state.users;
    const currentUser = computed(() => store.state.currentUser);
    const router = useRouter();

    const currentTab = shallowRef('/popular');
    const searchResults = ref([]);
    const isTabBarSticky = shallowRef(false);
    const isScrolled = shallowRef(false);
    const showTabs = ref(false);

    const switchTab = (path) => {
      currentTab.value = path;

    };


    const performSearch = (searchText) => {
        console.log("performSearch called with:", searchText);
     showTabs.value = false;
      // Filter topics and users based on searchText
      const filteredTopics = topics.filter(topic => topic.title.toLowerCase().includes(searchText.toLowerCase()));
      const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()));

      // Store all results in searchResults
      searchResults.value = {
        popular: [...filteredTopics].sort((a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes)),
        recent: [...filteredTopics].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        people: filteredUsers
      };
      // Display results based on current tab
      switchTab(currentTab.value);
      showTabs.value = true;
    };



    const goToProfile = (userId) => {
      if (currentUser.value.id === userId) {
        router.push(`/profil/${userId}`);
      }
      else {
        router.push(`/profile/${userId}`);
      }

    }



    return {
      currentTab,
      searchResults,
      isTabBarSticky,
      isScrolled,
      switchTab,
      showTabs,
      performSearch,
      goToProfile
    };
  },
};
</script>

<style lang="scss" scoped>
.sticky-tab-bar {
  z-index: 0;
}

.profil-inhalt {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  border-bottom: 0.5px solid #878a8c;
  height: 70px;
  padding-left: 10px;
}

.profile-image {
  border-radius: 50%;
  max-width: 90%;

}

.profil-inhalt h4 {
  padding-left: 15px;
}</style>
