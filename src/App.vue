<template>
  <div id="app">
    <layout-sidebar :starred-repos-len="starredRepos.length" :unlabeled-repos-len="unlabeledRepos.length" :labels="labels" @toggleLabel="handleToggleLabel" @saveNewLabel="handleSaveNewLabel"></layout-sidebar>
    <layout-main :label-repos="labelRepos" :loaded-starred-repos="loadedStarredRepos" :labels="labels" @addNewLabel="handleAddNewLabel" @deleteLabel="handleDeleteLabel"></layout-main>
  </div>
</template>

<script>
import axios from 'axios'

import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'

import { getStarredRepos, getGists, getFile, saveGist } from './api'

export default {
  name: 'app',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      starredRepos: [],
      loadedStarredRepos: false,
      labels: {},
      currentLabelName: '_all$',
      gistId: ''
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
      for (const { files, description, id } of gists) {
        if (description === 'gitstars') {
          this.gistId = id
          const { raw_url } = files[Object.keys(files)[0]]
          this.labels = await getFile(raw_url)
          break
        }
      }
      for (const { id, _labels } of this.starredRepos) {
        for (const key of Object.keys(this.labels)) {
          for (const repoId of this.labels[key]) {
            if (repoId === id) {
              _labels.push(key)
            }
          }
        }
      }
    }))
  },
  methods: {
    _getStarredRepos (page = 1) {
      return new Promise(async (resolve, reject) => {
        let repos = null
        do {
          repos = await getStarredRepos(page++)
          repos.forEach(repo => (repo._labels = []))
          this.starredRepos = this.starredRepos.concat(repos)
        } while (repos.length === 100)
        this.loadedStarredRepos = true
        resolve(this.starredRepos)
      })
    },
    handleToggleLabel (name) {
      this.currentLabelName = name
    },
    handleAddNewLabel ({ id, name }) {
      if (this.labels[name]) {
        if (!this.labels[name.includes(id)]) {
          this.labels[name].push(id)
        }
      } else {
        this.$set(this.labels, name, [id])
      }
      const { _labels } = this.starredRepos.find(repo => repo.id === id)
      _labels.push(name)
    },
    handleDeleteLabel ({ id, name }) {
      let index = this.labels[name].findIndex(repoId => repoId === id)
      this.labels[name].splice(index, 1)
      const { _labels } = this.starredRepos.find(repo => repo.id === id)
      index = _labels.findIndex(label => label === name)
      _labels.splice(index, 1)
    },
    handleSaveNewLabel (name) {
      this.$set(this.labels, name, [])
      saveGist(this.gistId, this.labels)
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
