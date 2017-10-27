<template>
  <main class="main">
    <layout-header></layout-header>
    <div class="content-wrap">
      <sub-sidebar :starred-repos="starredRepos" @toggleRepo="handleToggleRepo"></sub-sidebar>
      <div class="content">
        <article v-if="repoReadme" v-html="repoReadme" class="markdown-body"></article>
        <i v-else class="fa fa-5x fa-cloud" aria-hidden="true"></i>
      </div>
    </div>
  </main>
</template>

<script>
import LayoutHeader from './Header'
import SubSidebar from './SubSidebar'

import { getRepoReadme, getRenderedReadme } from '../api'

export default {
  name: 'main',
  components: { LayoutHeader, SubSidebar },
  props: {
    starredRepos: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      repoReadme: ''
    }
  },
  methods: {
    handleToggleRepo (repo) {
      getRepoReadme(repo).then(({ content }) => {
        const readme = decodeURIComponent(escape(window.atob(content)))
        console.log(readme)
        getRenderedReadme(readme).then(response => {
          this.repoReadme = response
        })
      })
    }
  }
}
</script>

<style>
.main {
  display: flex;
  flex-direction: column;
  flex: auto;
}

.content-wrap {
  display: flex;
  flex: auto;
}

.content {
  position: relative;
  overflow: auto;
  flex: auto;
  padding: 15px 0 30px;
}

.fa-cloud {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #e9e9e9;
}

.markdown-body {
  width: calc(100% - 60px);
  margin: 0 auto;
}
</style>
