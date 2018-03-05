<template>
  <div id="subsidebar">
    <sub-sidebar-header :searchValue.sync="searchValue" @onSwitchRepoSort="handleSwitchRepoSort"></sub-sidebar-header>
    <ul v-show="repos.length" class="repo-list">
      <repo v-for="repo of repos" :key="repo.id" :repo="repo" :class="{ active: repo.id === activeRepo.id }"></repo>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SubSidebarHeader from './SubSidebarHeader'
import Repo from './Repo'
import config from '../config'

export default {
  name: 'sub-sidebar',
  components: { SubSidebarHeader, Repo },
  data () {
    return {
      searchValue: '',
      sortKey: config.repoSorts.time.sortKey,
    }
  },
  computed: {
    ...mapState('repo', { activeRepo: 'active' }),
    repos () {
      const { searchValue, sortKey } = this
      return this.$store.getters['repo/reposOfTag']
        .filter(repo => repo.owner.login.toLowerCase().includes(searchValue) || repo.name.toLowerCase().includes(searchValue))
        .sort((a, b) => b[sortKey] - a[sortKey])
    },
  },
  methods: {
    handleSwitchRepoSort (key) {
      this.sortKey = key
    },
  },
}
</script>

<style scoped>
#subsidebar {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 359px;
  height: 100%;
  border-right: 1px solid #e9e9e9;
  background-color: #fbfbfb;
}

@media (min-width: 1500px) {
  #subsidebar {
    width: 409px;
  }
}

.repo-list {
  overflow: auto;
  flex: auto;
  padding: 0;
  margin: 0;
  list-style: none;
}

.repo-list::-webkit-scrollbar-thumb {
  background-color: #e9e9e9;
}
</style>
