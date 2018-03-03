<template>
  <div id="app">
    <layout-sidebar :defaultTags="defaultTags" :languageTags="languageTags" />
    <layout-main />
  </div>
</template>

<script>
import axios from 'axios'
import { mapMutations } from 'vuex'
import LayoutSidebar from './components/Sidebar'
import LayoutMain from './components/Main'
import { getGitstarsGist, getStarredRepos, getUserGists, createGitstarsGist } from './api'
import appConfig from './config'

async function loadStarredRepos (page = 1) {
  let starredRepos = []
  let repos = []

  do {
    repos = await getStarredRepos(page++)
    repos.forEach((repo, index) => {
      repo._customTags = []
      repo[appConfig.repoSorts.time.sortKey] = repos.length - index
    })
    starredRepos.push(...repos)
  } while (repos.length === appConfig.starredReposPerPage)

  return starredRepos
}

async function loadGitstarsData () {
  const GITSTARS_GIST_ID = 'gitstars_gist_id'
  let gitstarsGistId = window.localStorage.getItem(GITSTARS_GIST_ID)
  let content = null

  if (gitstarsGistId) {
    content = window.localStorage.getItem(gitstarsGistId)

    if (!content) {
      const { files } = await getGitstarsGist(gitstarsGistId)
      content = files[appConfig.filename].content
    }

    content = JSON.parse(content)
  } else {
    const gists = await getUserGists()

    for (const { id, description, files } of gists) {
      if (description === appConfig.description) {
        gitstarsGistId = id
        content = await axios.get(files[appConfig.filename].raw_url)
        break
      }
    }

    if (!gitstarsGistId) {
      content = { lastModified: Date.now(), tags: [] }
      const { id } = await createGitstarsGist(content)
      gitstarsGistId = id
    }

    window.localStorage.setItem(GITSTARS_GIST_ID, gitstarsGistId)
  }

  window._gitstars.gistId = gitstarsGistId
  return content
}

export default {
  name: 'App',
  components: { LayoutSidebar, LayoutMain },
  data () {
    return {
      defaultTags: Object.values(appConfig.defaultTags),
      languageTags: [],
    }
  },
  async mounted () {
    Promise.all([loadGitstarsData(), loadStarredRepos()])
      .then(([content, starredRepos]) => {
        let dateNow = Date.now()
        starredRepos.forEach(({ id: repoId, language }) => {
          appConfig.defaultTags.all.repos.push(repoId)

          if (!language) return

          const languageTag = this.languageTags.find(tag => tag.name === language)
          if (languageTag) {
            languageTag.repos.push(repoId)
          } else {
            this.languageTags.push({
              id: dateNow,
              categoryId: appConfig.tagCategorys.language.id,
              name: language,
              repos: [repoId],
            })
            dateNow += 1
          }
        })

        content.tags.forEach(tag => {
          tag.repos.forEach((repoId, index, repos) => {
            const repo = starredRepos.find(({ id }) => id === repoId)
            if (repo) {
              repo._customTags.push(tag)
            } else {
              repos[index] = undefined
            }
          })
          tag.repos = tag.repos.filter(repo => repo)
        })

        appConfig.defaultTags.untagged.repos = starredRepos.filter(repo => !repo._customTags.length).map(repo => repo.id)
        this.defaultTags = Object.values(appConfig.defaultTags)

        return { starredRepos, customTags: content.tags }
      })
      .then(({ starredRepos, customTags }) => {
        this.initStarredRepos(starredRepos)
        this.initCustomTags(customTags)
      })
  },
  methods: {
    ...mapMutations(['initStarredRepos', 'initCustomTags']),
  },
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
/* @import "element-ui.css"; */
</style>
