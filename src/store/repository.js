import { defineStore } from 'pinia';
import { getStarredRepos } from '@/server/github';
import { STARRED_REPOS } from '@/constants';

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
    all: [],
    selectedId: null,
    filterText: '',
    loading: true,
  }),

  getters: {
    selectedRepository: (state) => {
      return state.all.find((item) => item.id === state.selectedId);
    },
  },

  actions: {
    async resolveRepositories() {
      this.loading = true;
      let localRepos = localStorage.getItem(STARRED_REPOS);
      if (localRepos) {
        localRepos = JSON.parse(localRepos);
        this.all.push(...localRepos);

        if (import.meta.env.PROD) {
          const tmp = await _resolveRepositories();
          this.all = tmp;
        }
      } else {
        await _resolveRepositories(this.all);
      }
      localStorage.setItem(STARRED_REPOS, JSON.stringify(this.all));
      this.loading = false;
    },
  },
});
