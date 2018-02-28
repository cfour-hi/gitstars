<template>
  <header class="repo-readme__header">
    <h3 v-if="Object.keys(activeRepo).length" class="repo-title">
      <a :href="activeRepo.html_url" target="_blank">
        <i class="fa fa-fw fa-lg fa-github" aria-hidden="true"></i>
      </a>
      {{ activeRepo.owner.login }} / {{ activeRepo.name }}
    </h3>
    <el-autocomplete
      v-model="tagName"
      :fetch-suggestions="handleFetchTagSuggestions"
      :placeholder="$t('addNewTag')"
      :debounce="0"
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
import { mapState } from 'vuex'

export default {
  name: 'RepoReadmeHeader',
  data () {
    return {
      tagName: ''
    }
  },
  computed: {
    ...mapState(['activeRepo']),
    currentRepoUntaggedTags () {
      return this.$store.state.customTags
        .filter(tag => !this.activeRepo._customTags.find(({ id }) => id === tag.id))
        .map(({ name }) => name)
    }
  },
  methods: {
    handleFetchTagSuggestions (inputStr, cb) {
      inputStr = inputStr.toLowerCase()
      cb(this.currentRepoUntaggedTags
        .filter(name => name.toLowerCase().includes(inputStr))
        .map(name => ({ value: name })))
    },
    handleAddRepoTag () {
      this.$store.dispatch('addRepoCustomTag', this.tagName.trim())
      this.tagName = ''
    }
  }
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
