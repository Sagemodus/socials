<template>

  <!-- Sortieren nach Dropdown -->
  <div class="sortieren-filtern">

    <div class="sortieren">
      <select id="sort-select" v-model="sortBy"  >
        <option value="recent">Recent</option>
        <option value="popular">Popular</option>
      </select>
    </div>

    <div class="zahnrad">
      <button @click="openSearchPopup" class="filter-zahnrad">
        <font-awesome-icon icon="cog"  :style="{ color: iconColor(currentUser.farbe) }"/>
      </button>

    </div>
  </div>


   





  
  


  <!-- Popup-Fenster -->
  <div v-if="dialogVisible" class="popup-overlay">
    <div class="popup-content">

       <div class="oberer-teil">
       <h5 class="filter-title">Filtering</h5>
             <input type="text" v-model="searchText" placeholder="Search categories"  />
      <div class="selected-categories">
        <div v-for="selectedCategory in selectedCategories" :key="`${selectedCategory.main}-${selectedCategory.sub}`"
          class="selected-category">
          <span>{{ selectedCategory.main }} - {{ selectedCategory.sub }}</span>
          <div @click="removeSelectedCategory(selectedCategory)" class="remove-category"><font-awesome-icon
              :icon="['fas', 'trash']" style="color: #ffffff;" /></div>
        </div>
      </div>

<ul v-if="showCategories" class="filter-categories">
        <li v-for="(category, index) in filteredCategories" :key="index" @click="toggleCategorySelection(category)"
          class="filter-category">
          <span>{{ category.main }} - {{ category.sub }}</span>
          <div v-if="isCategorySelected(category)" class="category-selected">✔</div>
        </li>
      </ul>

       </div>

    <div class="unterer-teil">
      
      <div class="buttons-close-save">
      <button @click="closeSearchPopup" class="close-button">Close</button>
      <button @click="saveSearchPopup" class="save-button">Save</button>
      </div>

     </div>

      <!-- Liste der gefilterten Kategorien -->


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
      currentUser,
      iconColor,
      
    };
  },
};
</script>





<style scoped>


.buttons-close-save {
    display: flex;
    flex-direction: row;
    justify-content: center;
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
    flex-direction: row;
    justify-content: center;
    max-width: 100%;
    margin-top: 15px;
}

.selected-category {
  background-color: var(--iconColor);
  color: #fff;
  padding: 3px 8px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  margin-right: 5px;
      max-width: 48%;
}
li span{
  
    max-width: 80%;

}
.selected-category span {
  margin-right: 5px;
  font-size: 10px;
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

.popup-content[data-v-d2c6f850][data-v-d2c6f850] {
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    min-width: 80%;
    min-height: 70%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 90%;
    max-height: 90%;
}
/* Stile für die Filterkategorien */
.filter-categories {
  list-style: none;
  padding: 0;
  max-height: 250px; /* Maximale Höhe anpassen */
  overflow-y: auto; /* Scroll-Leiste anzeigen, wenn der Inhalt die maximale Höhe überschreitet */
}

.filter-category {
    display: flex;
    align-items: center;
    justify-content: center;
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

.close-button {
  margin-right: 10px; /* Fügt einen Abstand zwischen den Schaltflächen hinzu */
}


.close-button:hover,
.save-button:hover {
  background-color: var(--iconColor);
  /* Farbwechsel bei Hover */
}
button.filter-zahnrad {
    background-color: transparent;
    border: none;
    font-size: 20px;
}
.sortieren[data-v-d2c6f850] {
    min-width: 90%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
select#sort-select {
    min-width: 50%;
    border: black;
      outline: none;
      background-color: transparent;
}
input[type="text"] {
    outline: none;
    min-width: 85%;
}

h5.filter-title {
    margin-bottom: 10px;
    margin-top: 10px;
    font-size: 18px;
}

.unterer-teil {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Ändert die Hintergrundfarbe der ausgewählten Optionen im Dropdown-Menü */

</style>