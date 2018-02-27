<template>
  <div id="subsidebar">
    <sub-sidebar-header
      @onChangeSearchValue="handleChangeSearchValue"
      @onSwitchRepoSort="handleSwitchRepoSort"
    ></sub-sidebar-header>
    <repo-list :repos="repos" @onSwitchActiveRepo="handleSwitchActiveRepo"></repo-list>
  </div>
</template>

<script>
import SubSidebarHeader from './SubSidebarHeader'
import RepoList from './RepoList'
import config from '../config'

export default {
  name: 'SubSidebar',
  components: {
    SubSidebarHeader,
    RepoList
  },
  data () {
    return {
      searchValue: '',
      sortKey: config.repoSorts.time.sortKey
    }
  },
  computed: {
    repos () {
      const { searchValue, sortKey } = this

      return this.$store.getters.activeRepos
        .filter(({ owner = {}, name = '' }) => {
          return (
            owner.login.toLowerCase().includes(searchValue) ||
            name.toLowerCase().includes(searchValue)
          )
        })
        .sort((a, b) => b[sortKey] - a[sortKey])
    }
  },
  methods: {
    handleChangeSearchValue (value) {
      this.searchValue = value
    },
    handleSwitchRepoSort (key) {
      this.sortKey = key
    },
    handleSwitchActiveRepo (repo) {
      this.$emit('onSwitchActiveRepo', repo)
    }
  }
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
</style>
