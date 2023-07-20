import { defineStore } from 'pinia';
import { useRepositoryStore } from './repository';

export const useTopicStore = defineStore('topic', {
  state: () => ({
    topicMap: {},
  }),

  actions: {
    async analyze() {
      const repositoryStore = useRepositoryStore();
      const topicMap = {};

      repositoryStore.all.forEach((repository) => {
        repository.topics.forEach((topic) => {
          if (topicMap[topic]) {
            topicMap[topic].push(repository.id);
          } else {
            topicMap[topic] = [repository.id];
          }
        });
      });
      this.topicMap = topicMap;
    },
  },
});
