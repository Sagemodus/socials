<template>
  <!-- Sortieren nach Dropdown -->
  <div class="sortieren-filtern">

    <div class="sortieren">
      <label for="sort-select">Sort by:</label>
      <select id="sort-select" v-model="sortBy">
        <option value="recent">Recent</option>
        <option value="popular">Popular</option>
      </select>
    </div>

    <div class="filter-zahnrad">
      <button @click="openSearchPopup">
        <font-awesome-icon icon="cog" />
      </button>

    </div>
  </div>


  <!-- Button zum Öffnen des Popups -->


  <!-- Popup-Fenster -->
  <div v-if="dialogVisible" class="popup-overlay">
    <div class="popup-content">
      <h2>Filtering</h2>

      <!-- Suchleiste (Input) mit ausgewählten Kategorien -->
      <input type="text" v-model="searchText" placeholder="Search categories" />
      <div class="selected-categories">
        <div v-for="selectedCategory in selectedCategories" :key="`${selectedCategory.main}-${selectedCategory.sub}`"
          class="selected-category">
          <span>{{ selectedCategory.main }} - {{ selectedCategory.sub }}</span>
          <div @click="removeSelectedCategory(selectedCategory)" class="remove-category"><font-awesome-icon
              :icon="['fas', 'trash']" style="color: #ffffff;" /></div>
        </div>
      </div>

      <!-- Liste der gefilterten Kategorien -->
      <ul v-if="showCategories" class="filter-categories">
        <li v-for="(category, index) in filteredCategories" :key="index" @click="toggleCategorySelection(category)"
          class="filter-category">
          <span>{{ category.main }} - {{ category.sub }}</span>
          <div v-if="isCategorySelected(category)" class="category-selected">✔</div>
        </li>
      </ul>
      <button @click="closeSearchPopup" class="close-button">Close</button>
      <button @click="saveSearchPopup" class="save-button">Save</button>
    </div>
  </div>

  <!-- Loop durch die Daten und erstelle TopicBox-Komponenten für jedes passende Thema -->
  <TopicBox v-for="topic in sortedTopics" :key="topic.id" :id="topic.id" />
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import TopicBox from './TopicBox';
import { useRouter } from 'vue-router';
import { iconColor } from '../components/farben';

export default {
  components: {
    TopicBox,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const topics = computed(() => store.state.topics);
    const currentUser = computed(() => store.state.currentUser);
    const categories = computed(() => store.state.categories);
    const searchText = ref('');
    const filterSettings = computed(() => currentUser.value.filterSettings);
    const selectedCategories = computed(() => filterSettings.value.categories);

    const sortBy = ref('recent');
    const dialogVisible = ref(false);
    const showCategories = ref(false);
    const selectedCategory = ref(null);

    const toggleCategorySelection = (category) => {
      if (isCategorySelected(category)) {
        removeSelectedCategory(category);
      } else {
        addSelectedCategory(category);
      }
    };

    const closeSearchPopup = () => {
      searchText.value = '';
      dialogVisible.value = false;
    };

    const addSelectedCategory = (category) => {
      if (!isCategorySelected(category)) {
        selectedCategories.value.push(category);
      }
      searchText.value = '';
    };

    const removeSelectedCategory = (category) => {
      const index = selectedCategories.value.findIndex(
        (c) => c.main === category.main && c.sub === category.sub
      );
      if (index !== -1) {
        selectedCategories.value.splice(index, 1);
      }
    };

    const isCategorySelected = (category) => {
      return selectedCategories.value.some((c) => c.main === category.main && c.sub === category.sub);
    };

    const saveSearchPopup = () => {
      const updatedFilterSettings = { ...currentUser.value.filterSettings };
      updatedFilterSettings.categories = selectedCategories.value;
      store.commit('updateCurrentUser', { filterSettings: updatedFilterSettings });
      dialogVisible.value = false;
    };

    const openSearchPopup = () => {
      dialogVisible.value = true;
    };

    watch(searchText, () => {
      showCategories.value = searchText.value !== '';
      selectedCategory.value = null;
    });

    const filteredCategories = computed(() => {
      const searchTextLower = searchText.value.toLowerCase();
      return categories.value.filter((category) => {
        return (
          category.main.toLowerCase().includes(searchTextLower) ||
          category.sub.toLowerCase().includes(searchTextLower)
        );
      });
    });

    // Funktion zur Sortierung und Filterung der Themen
    const filterAndSortTopics = () => {
      const filtered = topics.value.filter((topic) => {
        return selectedCategories.value.some(
          (category) => category.main === topic.category.main && category.sub === topic.category.sub
        );
      });

      if (sortBy.value === 'recent') {
        return filtered.slice().sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      } else if (sortBy.value === 'popular') {
        return filtered.slice().sort((a, b) => {
          const totalVotesA = a.upvotes + a.downvotes;
          const totalVotesB = b.upvotes + b.downvotes;
          return totalVotesB - totalVotesA;
        });
      }

      return filtered.slice();
    };

    // Watcher für sortBy und selectedCategories, um die Themen neu zu berechnen
    const sortedTopics = computed(() => filterAndSortTopics());

    const handleTopicClick = (topicId) => {
      router.push({ name: 'TopicDetails', params: { id: topicId } });
    };

    return {
      sortBy,
      dialogVisible,
      openSearchPopup,
      topics,
      sortedTopics,
      handleTopicClick,
      filterSettings,
      saveSearchPopup,
      categories,
      selectedCategories,
      addSelectedCategory,
      removeSelectedCategory,
      toggleCategorySelection,
      closeSearchPopup,
      isCategorySelected,
      searchText,
      showCategories,
      selectedCategory,
      filteredCategories,
    };
  },
};
</script>





<style scoped>

.filter-category{
  border: ;
}
.sortieren-filtern {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* Stile für das Popup und das Overlay */
.selected-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
  padding-bottom: 20px;
}

.selected-category {
  background-color: var(--iconColor);
  color: #fff;
  padding: 3px 8px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.selected-category span {
  margin-right: 5px;
  /* Abstand zwischen Text und X */
}

.remove-category {
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  /* Hintergrundfarbe für das X */
  border-radius: 50%;
  /* Runder Rand für das X */
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-category:hover {
  background-color: #c82333;
  /* Farbwechsel bei Hover */
}

.category-selected {
  margin-left: 5px;
  font-weight: bold;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  /* Maximale Breite des Popups */
  overflow-y: auto;
  /* Hinzugefügt, um eine Scroll-Leiste hinzuzufügen */
  max-height: 70vh;
  /* Maximal erlaubte Höhe des Popups mit Scroll-Leiste */
}

/* Stile für die Filterkategorien */
.filter-categories {
  list-style: none;
  padding: 0;
}

.filter-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  cursor: pointer;
}

.filter-category span {
  flex-grow: 1;
}

.filter-category .category-selected {
  color: #28a745;
  /* Farbe für ausgewählte Kategorien */
}

/* Stile für die Schaltflächen */
.close-button,
.save-button {
  background-color: var(--iconColor);
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-button:hover,
.save-button:hover {
  background-color: var(--iconColor);
  /* Farbwechsel bei Hover */
}</style>