<template>
    <div>
        <TopicBox v-for="topic in topicsSuche" :key="topic.id" :id="topic.id" :disableelements="true" />
    </div>
</template>

<script>
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { computed } from 'vue';
import TopicBox from '../TopicBox.vue';

export default {
    components: {
        TopicBox,
    },
    setup() {
        const store = useStore();
        const route = useRoute();
        const userId = route.params.userId;
        const topics = store.state.topics;

        const bookmarkPathArray = computed(() => {
            return store.state.users[userId - 1].topicsaves;
        });

        const parseId = (element) => {
            const parts = element.split('/').filter(part => part !== '');
            const ids = {
                topicIndex: parts[0],
                type: parts[1]?.split('_')[0],
                commentIndex: parts[1]?.split('_')[1],
            };

            for (let i = 2; i < parts.length; i++) {
                ids['replyIndex' + (i - 1)] = parts[i];
            }

            return ids;
        }

        const topicsSuche = [];

        function getLastElementFromPath() {
            bookmarkPathArray.value.forEach(path => {
                const ids = parseId(path);
                if (ids.topicIndex !== undefined && topics[ids.topicIndex]) {
                    topicsSuche.push(topics[ids.topicIndex]);
                }
            });
        }

        getLastElementFromPath();

        return {
            topicsSuche,
        };
    },
};
</script>

<style>
/* Deine CSS-Stile hier */
</style>
