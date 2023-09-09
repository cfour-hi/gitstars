import { defineStore } from 'pinia';
import { TAG_TYPE, TAG_SORT_TYPE, TAG_SRC } from '@/constants';
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
     * tag 来源
     *  1. 自己 star 的仓库
     *  2. Github 排行榜
     */
    tagSrc: TAG_SRC.self,
    /**
     * 当前选中 tag
     * topic 或 language
     */
    selectedTag: '',
    /**
     * 当前选中 tag 类型
     * topic 和 language 的 tag 名可能相同
     * 需要此标识判断当前选中的 tag 是属于什么类型
     */
    selectedTagType: '',
    /**
     * 当前选中 tag 类别
     * 用于 sidebar 底部 Topics 和 Languages 的高亮状态
     */
    selectedTagTypeNav: TAG_TYPE.topic,
    /**
     * tag 搜索内容
     */
    filterText: '',
    /**
     * tag 排序
     */
    sortType: TAG_SORT_TYPE.amountDown.value,
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
