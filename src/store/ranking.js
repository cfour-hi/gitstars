import { defineStore } from 'pinia';
import {
  getGithubRankingLanguageList,
  getGithubRankingLanguageMap,
} from '@/server/github';

export const useRankingStore = defineStore('ranking', {
  state: () => ({
    /**
     * 语言 tag 列表
     */
    languageList: [],
    /**
     * 语言 tag: 仓库列表
     */
    languageMap: {},
    /**
     * 当前选中的语言 tag
     */
    selectedLanguage: '',
    /**
     * 语言 tag 过滤
     */
    filterText: '',
    /**
     * 语言列表加载状态
     */
    languageLoading: false,
    /**
     * 语言列表加载失败信息
     */
    languageError: '',
    /**
     * 排行榜加载状态
     */
    rankingLoading: false,
    /**
     * 排行榜加载失败信息
     */
    rankingError: '',
  }),

  getters: {
    repositories: (state) => {
      // 同一个仓库可能出现在多个语言的排行榜中，需要去重
      const repositoryMap = new Map();

      Object.values(state.languageMap).forEach((repositories) => {
        repositories.forEach((repository) => {
          if (!repositoryMap.has(repository.id)) {
            repositoryMap.set(repository.id, repository);
          }
        });
      });

      return [...repositoryMap.values()];
    },
  },

  actions: {
    /**
     * 获取语言列表
     */
    async resolveLanguageList() {
      if (this.languageLoading || this.languageList.length > 0) return;

      this.languageLoading = true;
      this.languageError = '';

      try {
        this.languageList = await getGithubRankingLanguageList();
      } catch (error) {
        this.languageError = error.message || 'unknown';
        console.error('Failed to load ranking languages:', error);
      } finally {
        this.languageLoading = false;
      }
    },
    /**
     * 获取语言: 仓库列表
     */
    async resolveLanguageMap() {
      if (this.rankingLoading || Object.keys(this.languageMap).length > 0) {
        return;
      }

      this.rankingLoading = true;
      this.rankingError = '';

      try {
        this.languageMap = await getGithubRankingLanguageMap();
      } catch (error) {
        this.rankingError = error.message || 'unknown';
        console.error('Failed to load ranking repositories:', error);
      } finally {
        this.rankingLoading = false;
      }
    },
  },
});
