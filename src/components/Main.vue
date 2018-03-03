<template>
  <div id="main">
    <layout-header />
    <div class="main-body">
      <sub-sidebar @onSwitchActiveRepo="handleSwitchActiveRepo" />
      <repo-readme :readme="repoReadme" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import LayoutHeader from './Header'
import SubSidebar from './SubSidebar'
import RepoReadme from './RepoReadme'
import { getRepoReadme, getRenderedReadme } from '../api'

let repoReadmeSource = axios.CancelToken.source()
let renderedReadmeSource = axios.CancelToken.source()

export default {
  name: 'Main',
  components: { LayoutHeader, SubSidebar, RepoReadme },
  data () {
    return {
      repoReadme: '',
    }
  },
  methods: {
    async handleSwitchActiveRepo (repo) {
      repoReadmeSource.cancel()
      renderedReadmeSource.cancel()
      repoReadmeSource = axios.CancelToken.source()
      renderedReadmeSource = axios.CancelToken.source()

      this.repoReadme = ''
      this.$store.commit('changeActiveRepo', repo)

      try {
        const { content } = await getRepoReadme(repo.owner.login, repo.name, repoReadmeSource)
        // 包含中文内容的 base64 解码
        this.repoReadme = await getRenderedReadme(decodeURIComponent(escape(atob(content))), renderedReadmeSource)
      } catch (err) { }
    },
  },
}
</script>

<style scoped>
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
