<template>
  <div class="content">
    <section class="repo-readme">
      <repo-readme-header v-show="isSelectedRepo"></repo-readme-header>
      <article v-show="readme" v-html="readme" class="markdown-body"></article>
    </section>
    <section v-show="!readme" class="waiting vc-p">
      <h4 class="readme">README.md</h4>
      <p class="loader">
        <i v-show="isSelectedRepo && !readme" class="fa fa-cog fa-spin fa-2x fa-fw"></i>
        <span v-if="!isSelectedRepo">
          <i class="fa fa-hand-o-left fa-lg" aria-hidden="true"></i>
          <span class="ttc">{{ $t('clickLeftStarredRepoToView') }}</span>
        </span>
      </p>
    </section>
  </div>
</template>

<script>
import RepoReadmeHeader from './RepoReadmeHeader'

export default {
  name: 'RepoReadme',
  components: { RepoReadmeHeader },
  props: {
    readme: { type: String, default: '' },
  },
  computed: {
    isSelectedRepo () {
      return !!Object.keys(this.$store.state.activeRepo).length
    },
  },
}
</script>

<style scoped>
.content {
  position: absolute;
  left: 360px;
  right: 0;
  height: 100%;
  min-width: 700px;
}

@media (min-width: 1500px) {
  .content {
    left: 410px;
  }
}

.repo-readme {
  height: 100%;
}

.markdown-body {
  overflow: auto;
  height: calc(100% - 85px);
  padding: 20px;
  font-size: 14px;
  color: #5a5a5a;
}

.markdown-body::-webkit-scrollbar {
  width: 8px;
}

.waiting {
  top: 40%;
  font-size: 14px;
  text-align: center;
  color: #d9d9d9;
  user-select: none;
}

.readme {
  font-size: 28px;
  margin: 0.5em;
  font-weight: 700;
}

.loader {
  height: 28px;
}
</style>
