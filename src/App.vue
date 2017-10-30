<template>
  <div id="app">
    <layout-sidebar :starred-repos-len="starredRepos.length" :unlabeled-repos-len="unlabeledRepos.length" :labels="labels" @toggleLabel="handleToggleLabel"></layout-sidebar>
    <layout-main :label-repos="labelRepos" :loaded-starred-repos="loadedStarredRepos"></layout-main>
  </div>
</template>

<script>
import axios from 'axios'

import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos, getGists, getFile } from './api'

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      starredRepos: [],
      loadedStarredRepos: false,
      labels: {},
      currentLabelName: '_all$'
    }
  },
  computed: {
    unlabeledRepos () {
      let reposId = []
      for (const repos of Object.keys(this.labels)) {
        reposId = reposId.concat(this.labels[repos])
      }
      const labledReposId = new Set(reposId)
      const unlabeledRepos = []

      for (const repo of this.starredRepos) {
        const { id } = repo
        if (labledReposId.has(id)) continue
        unlabeledRepos.push(repo)
      }

      return unlabeledRepos
    },
    labelRepos () {
      if (this.currentLabelName === '_all$') return this.starredRepos
      if (this.currentLabelName === '_unlabeled$') return this.unlabeledRepos

      const labelRepos = []
      const labelReposId = this.labels[this.currentLabelName]

      for (const repo of this.starredRepos) {
        const { id } = repo
        if (!labelReposId.includes(id)) continue
        labelRepos.push(repo)
      }

      return labelRepos
    }
  },
  created () {
    axios.all([this._getStarredRepos(), getGists()]).then(axios.spread(async (repos, gists) => {
      for (const { files, description } of gists) {
        if (description === 'gitstars') {
          const { raw_url } = files[Object.keys(files)[0]]
          this.labels = await getFile(raw_url)
          break
        }
      }
      // TODO
    }))
  },
  methods: {
    _getStarredRepos (page = 1) {
      return new Promise(async (resolve, reject) => {
        let repos = null
        do {
          repos = await getStarredRepos(page++)
          this.starredRepos = this.starredRepos.concat(repos)
        } while (repos.length === 100)
        this.loadedStarredRepos = true
        resolve(this.starredRepos)
      })
    },
    handleToggleLabel (name) {
      this.currentLabelName = name
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
