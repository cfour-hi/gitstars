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
  }),

  getters: {
    repositories: (state) =>
      Object.values(state.languageMap)
        .flat()
        .filter(
          (repo, index, self) =>
            self.findIndex(({ id }) => id === repo.id) === index,
        ),
  },

  actions: {
    /**
     * 获取语言列表
     */
    async resolveLanguageList() {
      this.languageList = await getGithubRankingLanguageList();
    },
    /**
     * 获取语言: 仓库列表
     */
    async resolveLanguageMap() {
      this.languageMap = await getGithubRankingLanguageMap();
    },
  },
});
