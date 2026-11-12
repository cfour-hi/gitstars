import { defineStore } from 'pinia';
import { getStarredRepositories } from '@/server/github';
import { STARRED_REPOS } from '@/constants';
import { useTagStore } from '@/store/tag';
import { useRankingStore } from '@/store/ranking';

const PAGE_SIZE = 100;
const PARALLEL_NUM = 2;

/**
 * 通过 HTTP 分页获取全部 starred repositories
 *
 * @returns {Promise<Array>}
 */
async function resolveRepositoriesByHTTP() {
  const repositories = [];
  let page = 1;

  for (;;) {
    const requests = Array.from({ length: PARALLEL_NUM }, (_, index) =>
      getStarredRepositories({ page: page + index, per_page: PAGE_SIZE }),
    );
    const batch = (await Promise.all(requests)).flat();
    repositories.push(...batch);

    if (batch.length < PAGE_SIZE * PARALLEL_NUM) break;
    page += PARALLEL_NUM;
  }

  return repositories;
}

function readCachedRepositories() {
  try {
    const cached = localStorage.getItem(STARRED_REPOS);
    if (!cached) return [];
    const repositories = JSON.parse(cached);
    return Array.isArray(repositories) ? repositories : [];
  } catch (error) {
    console.error('Failed to read cached repositories:', error);
    localStorage.removeItem(STARRED_REPOS);
    return [];
  }
}

function cacheRepositories(repositories) {
  try {
    localStorage.setItem(STARRED_REPOS, JSON.stringify(repositories));
  } catch (error) {
    // LocalStorage 容量有限，缓存失败不应影响本次浏览
    console.error('Failed to cache repositories:', error);
  }
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
     * repositories 拉取失败信息
     */
    error: '',
    /**
     * repositories 排序
     * time 或 star
     */
    sortType: 'time',
  }),

  getters: {
    /**
     * 当前条件下的 repositories
     */
    filteredRepositories: (state) => {
      let repositoriesTmp = [];
      const tagStore = useTagStore();
      const rankingStore = useRankingStore();

      if (tagStore.tagSrc === 'star') {
        if (!tagStore.selectedTag) {
          /**
           * 当前未选中 tag
           * 展示所有 repositories
           * 不可直接使用 state.all
           * 下文的排序处理会对 repositoriesTmp 进行变更
           * 变更会触发 tag 分析
           * 导致 tag 数据累加（错误）
           */
          repositoriesTmp = [...state.all];
        } else if (tagStore.selectedTagType === 'topic') {
          /**
           * 当前选中的 tag 属于 Topics
           * 从 topicMap 找到 tag 及其对应的 repositories id
           */
          const repositoryIds = new Set(
            tagStore.topicMap[tagStore.selectedTag] ?? [],
          );
          repositoriesTmp = state.all.filter((repository) =>
            repositoryIds.has(repository.id),
          );
        } else if (tagStore.selectedTagType === 'language') {
          /**
           * 当前选中的 tag 属于 Languages
           * 从 languageMap 找到 tag 及其对应的 repositories id
           */
          const repositoryIds = new Set(
            tagStore.languageMap[tagStore.selectedTag] ?? [],
          );
          repositoriesTmp = state.all.filter((repository) =>
            repositoryIds.has(repository.id),
          );
        }
      } else if (tagStore.tagSrc === 'ranking') {
        if (rankingStore.selectedLanguage) {
          repositoriesTmp = [
            ...(rankingStore.languageMap[rankingStore.selectedLanguage] ?? []),
          ];
        } else {
          repositoriesTmp = [...(rankingStore.languageMap.all ?? [])];
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
        tagStore.tagSrc === 'star' &&
        repositoriesTmp.length > 0 &&
        state.sortType === 'star'
      ) {
        repositoriesTmp.sort((a, b) => b.stargazers_count - a.stargazers_count);
      }

      return repositoriesTmp;
    },

    /**
     * 当前选中的 repository
     */
    selectedRepository: (state) => {
      const rankingStore = useRankingStore();
      return (
        state.all.find((item) => item.id === state.selectedId) ||
        rankingStore.repositories.find((item) => item.id === state.selectedId)
      );
    },
  },

  actions: {
    /**
     * 获取 repositories
     * LocalStorage 或 HTTP
     */
    async resolveRepositories() {
      this.loading = true;
      this.error = '';

      const cachedRepositories = readCachedRepositories();
      if (cachedRepositories.length > 0) this.all = cachedRepositories;

      try {
        const repositories = await resolveRepositoriesByHTTP();
        // 直接整体替换数组；虚拟列表在监听里 forceUpdate 重新计算可见项，
        // 不再清空后再回填，避免列表闪烁和 README 重复请求
        this.all = repositories;
        cacheRepositories(repositories);
      } catch (error) {
        // 拉取失败时保留缓存数据，不影响已有内容的浏览
        this.error = error.message || 'unknown';
        console.error('Failed to update repositories:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
