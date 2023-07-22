import { defineStore } from 'pinia';
import { getStarredRepos } from '@/server/github';
import { STARRED_REPOS, REPO_SORT_TYPE, TAG_TYPE } from '@/constants';
import { useTagStore } from '@/store/tag';

/**
 * 通过 HTTP 获取 repositories
 * @param {Array} list 渐进式添加 repositories 数据，让用户更快得到反馈
 * @returns
 */
async function _resolveRepositories(list = []) {
  const MAX_PAGE = 9999;
  const PER_PAGE = 100;
  for (let i = 1; i < MAX_PAGE; i++) {
    const repositories = await getStarredRepos({
      per_page: PER_PAGE,
      page: i,
    });
    list.push(...repositories);

    if (repositories.length < PER_PAGE) {
      break;
    }
  }
  return list;
}

export const useRepositoryStore = defineStore('repository', {
  state: () => ({
    /**
     * 所有 repositories
     */
    all: [],
    /**
     * 选中的 repository id
     */
    selectedId: null,
    /**
     * repositories 过滤内容
     */
    filterText: '',
    /**
     * 是否正在 HTTP 请求 repositories
     */
    loading: true,
    /**
     * repositories 排序
     * time 或 star
     */
    sortType: REPO_SORT_TYPE.time.value,
  }),

  getters: {
    /**
     * 当前条件下的 repositories
     */
    filteredRepositories: (state) => {
      let repositoriesTmp = [];
      const tagStore = useTagStore();

      if (!tagStore.selected) {
        /**
         * 当前未选中 tag
         * 展示所有 repositories
         * 不可直接使用 state.all
         * 下文的排序处理会对 repositoriesTmp 进行变更
         * 变更会触发 tag 分析
         * 导致 tag 数据累加（错误）
         */
        repositoriesTmp = [...state.all];
      } else if (tagStore.selectedType === TAG_TYPE.topic) {
        /**
         * 当前选中的 tag 属于 Topics
         * 从 topicMap 找到 tag 及其对应的 repositories id
         */
        const repositoryIds = tagStore.topicMap[tagStore.selected];
        if (repositoryIds) {
          repositoriesTmp = state.all.filter((repository) =>
            repositoryIds.includes(repository.id),
          );
        }
      } else if (tagStore.selectedType === TAG_TYPE.language) {
        /**
         * 当前选中的 tag 属于 Languages
         * 从 languageMap 找到 tag 及其对应的 repositories id
         */
        const repositoryIds = tagStore.languageMap[tagStore.selected];
        if (repositoryIds) {
          repositoriesTmp = state.all.filter((repository) =>
            repositoryIds.includes(repository.id),
          );
        }
      }

      /**
       * 过滤对当前展示的 repositories
       */
      if (state.filterText) {
        const filterText = state.filterText.toLowerCase();
        repositoriesTmp = repositoriesTmp.filter(
          (repository) =>
            repository.owner.login.toLowerCase().includes(filterText) ||
            repository.name.toLowerCase().includes(filterText) ||
            repository.description?.toLowerCase().includes(filterText),
        );
      }

      /**
       * 根据当前排序类型对当前展示的 repositories 排序
       * repositories 默认已经按 star 时间排序
       * 只需处理按 star 数量排序
       */
      if (
        repositoriesTmp.length > 0 &&
        state.sortType === REPO_SORT_TYPE.star.value
      ) {
        repositoriesTmp.sort((a, b) => b.stargazers_count - a.stargazers_count);
      }

      return repositoriesTmp;
    },

    /**
     * 当前选中的 repository
     */
    selectedRepository: (state) => {
      return state.all.find((item) => item.id === state.selectedId);
    },
  },

  actions: {
    /**
     * 获取 repositories
     * LocalStorage 或 HTTP
     */
    async resolveRepositories() {
      this.loading = true;
      let localRepos = localStorage.getItem(STARRED_REPOS);
      if (localRepos) {
        localRepos = JSON.parse(localRepos);
        this.all = localRepos;

        // 开发环境默认不通过 HTTP 更新 repositories
        if (!import.meta.env.DEV) {
          const tmp = await _resolveRepositories();
          this.all = tmp;
          localStorage.setItem(STARRED_REPOS, JSON.stringify(this.all));
        }
      } else {
        await _resolveRepositories(this.all);
        localStorage.setItem(STARRED_REPOS, JSON.stringify(this.all));
      }
      this.loading = false;
    },
  },
});
