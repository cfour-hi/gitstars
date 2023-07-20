import { defineStore } from 'pinia';
import { TAG_TYPE, REPO_SORT_TYPE } from '@/constants';
import { useRepositoryStore } from './repository';
import { useTopicStore } from './topic';
import { useLanguageStore } from './language';

export const useTagStore = defineStore('tag', {
  state: () => ({
    // 当前选中 tag 类型
    selectedType: '',
    // 当前选中 tag
    selected: '',
    // 当前选中 nav 类型
    selectedNav: TAG_TYPE.topic,
    filterText: '',
    sortType: REPO_SORT_TYPE.time.value,
  }),

  getters: {
    repositories: (state) => {
      const repositoryStore = useRepositoryStore();
      const topicStore = useTopicStore();
      const languageStore = useLanguageStore();
      let repositoriesTmp = [];

      if (!state.selected) {
        repositoriesTmp = [...repositoryStore.all];
      } else if (state.selectedType === TAG_TYPE.topic) {
        const repositoryIds = topicStore.topicMap[state.selected];
        if (repositoryIds) {
          repositoriesTmp = repositoryStore.all.filter((repository) =>
            repositoryIds.includes(repository.id),
          );
        }
      } else if (state.selectedType === TAG_TYPE.language) {
        const repositoryIds = languageStore.languageMap[state.selected];
        if (repositoryIds) {
          repositoriesTmp = repositoryStore.all.filter((repository) =>
            repositoryIds.includes(repository.id),
          );
        }
      }

      if (
        repositoriesTmp.length > 0 &&
        state.sortType === REPO_SORT_TYPE.star.value
      ) {
        repositoriesTmp.sort((a, b) => b.stargazers_count - a.stargazers_count);
      }

      return repositoriesTmp;
    },
  },
});
