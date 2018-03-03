<template>
  <li class="repo-item" @click="$emit('onSwitchActiveRepo')">
    <header>
      <h3 class="repo-title">
        <a :href="repo.html_url" target="_blank" rel="noopener noreferrer">{{ repo.owner.login }} / {{ repo.name }}</a>
        <a v-show="repo.homepage" :href="repo.homepage" target="_blank" rel="noopener noreferrer">
          <i class="fa fa-fw fa-lg fa-home" aria-hidden="true"></i>
        </a>
      </h3>
    </header>
    <p class="repo-desc">{{ repo.description }}</p>
    <ul class="tag-list">
      <repo-tag v-for="tag of repo._customTags" :key="tag.id" :repo="repo" :tag="tag" />
    </ul>
    <footer class="repo-footer">
      <span class="repo-star"><i class="fa fa-star" aria-hidden="true"></i>{{ repo.stargazers_count }}</span>
      <span class="repo-fork"><i class="fa fa-code-fork" aria-hidden="true"></i>{{ repo.forks_count }}</span>
      <span class="repo-language">{{ repo.language }}</span>
    </footer>
  </li>
</template>

<script>
import RepoTag from './RepoTag'

export default {
  name: 'Repo',
  components: { RepoTag },
  props: {
    repo: { type: Object, required: true },
  },
}
</script>

<style scoped>
.repo-item {
  padding: 15px;
  border-bottom: 1px solid #e9e9e9;
  cursor: pointer;
  background-color: #fff;
}

.repo-item:hover {
  background-color: #fbfbfb;
}

.repo-item.active {
  background-color: #f7f7f7;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.repo-item:last-child {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.repo-title {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 16px;
  color: #948aec;
}

.repo-desc {
  font-size: 12px;
  line-height: 1.5;
  color: #5a5a5a;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  font-size: 12px;
  list-style: none;
  color: #fff;
}

.repo-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5em;
  font-size: 12px;
  font-weight: 700;
  color: #76d0a3;
}

.repo-footer .fa {
  margin-right: 5px;
}

.repo-fork {
  margin-left: 15px;
}

.repo-language {
  flex: auto;
  text-align: right;
}
</style>
