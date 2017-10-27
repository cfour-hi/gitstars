<template>
  <div id="app">
    <layout-sidebar></layout-sidebar>
    <layout-main :starred-repos="starredRepos"></layout-main>
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
      starredRepos: []
    }
  },
  created () {
    getStarredRepos().then(response => {
      this.starredRepos = response
    })
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
