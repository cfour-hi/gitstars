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

const { defaultTags } = appConfig

export default {
  name: 'App',
  components: { LayoutSidebar, LayoutHeader, SubSidebar, RepoReadme },
  data () {
    return {
      languageTags: [],
    }
  },
  computed: {
    defaultTags () {
      return [
        Object.assign({}, defaultTags.all, { repos: this.$store.state.repo.repos }),
        Object.assign({}, defaultTags.untagged, { repos: this.$store.getters['repo/untaggedRepos'] }),
      ]
    },
  },
  mounted () {
    this.$store.dispatch('initGitstars').then(tags => Object.assign(this, tags))
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
@import './css/element-ui.css';
@import './css/app.css';
</style>
