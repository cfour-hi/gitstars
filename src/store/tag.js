import { defineStore } from 'pinia';
import { TAG_TYPE, REPO_SORT_TYPE } from '@/constants';
import { useRepositoryStore } from './repository';

/**
 * 统计分析 Topics 获取所有 topic 及其对应的 repositories
 */
function analyzeTopics() {
  const topicMap = {};
  const repositoryStore = useRepositoryStore();

  repositoryStore.all.forEach((repository) => {
    repository.topics.forEach((topic) => {
      if (topicMap[topic]) {
        topicMap[topic].push(repository.id);
      } else {
        topicMap[topic] = [repository.id];
      }
    });
  });
  return topicMap;
}

/**
 * 统计分析 Languages 获取所有 language 及其对应的 repositories
 */
function analyzeLanguages() {
  const languageMap = {};
  const repositoryStore = useRepositoryStore();

  repositoryStore.all.forEach((repository) => {
    if (!repository.language) return;

    if (languageMap[repository.language]) {
      languageMap[repository.language].push(repository.id);
    } else {
      languageMap[repository.language] = [repository.id];
    }
  });
  return languageMap;
}

export const useTagStore = defineStore('tag', {
  state: () => ({
    /**
     * 当前选中 tag 类型
     * topic 和 language 可能相同
     * 需要此标识判断 tag 是否处于 active 状态
     */
    selectedType: '',
    /**
     * 当前选中 tag
     * topic 或 language
     */
    selected: '',
    /**
     * 当前选中 nav 类型
     * sidebar 底部 Topics 和 Languages active 状态
     */
    selectedNav: TAG_TYPE.topic,
    /**
     * tag 搜索内容
     */
    filterText: '',
    /**
     * tag 排序
     */
    sortType: REPO_SORT_TYPE.time.value,
    /**
     * Topics
     */
    topicMap: {},
    /**
     * Languages
     */
    languageMap: {},
  }),

  actions: {
    /**
     * 统计分析 topics 和 languages
     */
    analyze() {
      this.topicMap = analyzeTopics();
      this.languageMap = analyzeLanguages();
    },
  },
});
