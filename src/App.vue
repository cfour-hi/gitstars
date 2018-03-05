<template>
  <div id="app">
    <layout-sidebar :defaultTags="defaultTags" :languageTags="languageTags"></layout-sidebar>
    <div id="main">
      <layout-header></layout-header>
      <div class="main-body">
        <sub-sidebar></sub-sidebar>
        <repo-readme></repo-readme>
      </div>
    </div>
  </div>
</template>

<script>
import LayoutSidebar from './components/Sidebar'
import LayoutHeader from './components/Header'
import SubSidebar from './components/SubSidebar'
import RepoReadme from './components/RepoReadme'
import appConfig from './config'

export default {
  name: 'App',
  components: { LayoutSidebar, LayoutHeader, SubSidebar, RepoReadme },
  data () {
    return {
      defaultTags: Object.values(appConfig.defaultTags),
      languageTags: [],
    }
  },
  async mounted () {
    this.$store.dispatch('initGitstars')
      .then(({ defaultTags, languageTags }) => {
        this.defaultTags = defaultTags
        this.languageTags = languageTags
      })
  },
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100%;
}

#main {
  display: flex;
  flex-direction: column;
  flex: auto;
}

.main-body {
  flex: auto;
  position: relative;
}
</style>

<style>
@import "./css/app.css";
@import "./css/element-ui.css";
</style>
