import { defineStore } from 'pinia';
import { TAG_TYPE } from '@/constants';
import { useRepositoryStore } from './repository';
import { useTopicStore } from './topic';
import { useLanguageStore } from './language';

export const useTagStore = defineStore('tag', {
  state: () => ({
    selectedType: TAG_TYPE.topic,
    selected: '',
    selectedNav: TAG_TYPE.topic,
    filterText: '',
  }),

  getters: {
    repositories: (state) => {
      const repositoryStore = useRepositoryStore();
      const topicStore = useTopicStore();
      const languageStore = useLanguageStore();

      if (!state.selected) {
        return repositoryStore.all;
      }

      if (state.selectedType === TAG_TYPE.topic) {
        const repositoryIds = topicStore.topicMap[state.selected];
        if (repositoryIds) {
          return repositoryStore.all.filter((repository) =>
            repositoryIds.includes(repository.id),
          );
        }
      } else if (state.selectedType === TAG_TYPE.language) {
        const repositoryIds = languageStore.languageMap[state.selected];
        if (repositoryIds) {
          return repositoryStore.all.filter((repository) =>
            repositoryIds.includes(repository.id),
          );
        }
      }

      return [];
    },
  },
});
