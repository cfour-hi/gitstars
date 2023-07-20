import { defineStore } from 'pinia';
import { useRepositoryStore } from './repository';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    languageMap: {},
  }),

  actions: {
    async analyze() {
      const repositoryStore = useRepositoryStore();
      const languageMap = {};

      repositoryStore.all.forEach((repository) => {
        if (!repository.language) return;

        if (languageMap[repository.language]) {
          languageMap[repository.language].push(repository.id);
        } else {
          languageMap[repository.language] = [repository.id];
        }
      });
      this.languageMap = languageMap;
    },
  },
});
