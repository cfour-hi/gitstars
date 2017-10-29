<template>
  <div id="app">
    <layout-sidebar :stared-repos-len="starredRepos.length"></layout-sidebar>
    <layout-main :starred-repos="starredRepos" :loaded-starred-repos="loadedStarredRepos"></layout-main>
  </div>
</template>

<script>
import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos } from './api'

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      starredRepos: [],
      loadedStarredRepos: false
    }
  },
  created () {
    this._getStarredRepos()
  },
  methods: {
    _getStarredRepos (page = 1) {
      return getStarredRepos(page).then(response => {
        this.starredRepos = this.starredRepos.concat(response)
        response.length < 100 ? this.loadedStarredRepos = true : this._getStarredRepos(++page)
      })
    }
  }
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100%;
}
</style>

<style>
@import "app.css";
</style>
