<template>
  <header class="repo-readme__header">
    <h3 v-if="visible" class="repo-title">
      <a :href="activeRepo.html_url" target="_blank" rel="noopener noreferrer">
        <i class="fa fa-fw fa-lg fa-github" aria-hidden="true"></i>
      </a>
      <span>{{ activeRepo.owner.login }} / {{ activeRepo.name }}</span>
    </h3>
    <el-autocomplete
      v-model="tagName"
      :fetch-suggestions="handleFetchTagSuggestions"
      :placeholder="$t('addNewTag')"
      :debounce="30"
      size="small"
      class="repo-tag-input"
      @select="handleAddRepoTag"
      select-when-unmatched>
      <i slot="prefix" class="fa fa-fw fa-lg fa-tag el-input__icon"></i>
      <el-button slot="append" @click="handleAddRepoTag" class="ttc">{{ $t('add') }}</el-button>
    </el-autocomplete>
  </header>
</template>

<script>
export default {
  name: 'repo-readme-header',
  props: {
    visible: { type: Boolean, default: false },
    activeRepo: { type: Object, required: true },
  },
  data () {
    return {
      tagName: '',
    }
  },
  computed: {
    currentRepoUntaggedTags () {
      return this.$store.state.tag.tags
        .filter(tag => !this.activeRepo._customTags.find(({ id }) => id === tag.id))
        .map(({ name }) => name)
    },
  },
  methods: {
    handleFetchTagSuggestions (inputStr, cb) {
      inputStr = inputStr.toLowerCase()
      cb(this.currentRepoUntaggedTags
        .filter(name => name.toLowerCase().includes(inputStr))
        .map(name => ({ value: name })))
    },
    handleAddRepoTag () {
      this.$store.dispatch('repo/addRepoTag', this.tagName.trim())
      this.tagName = ''
    },
  },
}
</script>

<style scoped>
.repo-readme__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 15px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #fbfbfb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.repo-readme__header .fa-github,
.repo-title {
  color: #5a5a5a;
}

.repo-tag-input {
  width: 200px;
}

.repo-tag-input .el-input-group__append .el-button {
  padding: 10px;
}
</style>
