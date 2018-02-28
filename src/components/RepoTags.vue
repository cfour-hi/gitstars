<template>
  <ul class="tag-list">
    <li v-for="tag of tags" :key="tag.id" class="tag-item" @click.stop="changeActiveTag(tag)">
      <el-tag size="small">
        {{ tag.name }}
        <el-popover :title="`${$t('areYouSure')}？`" placement="right">
          <i slot="reference" class="el-tag__close el-icon-close tag-delete-btn" @click.stop="handleDeleteTag"></i>
          <footer class="popover-footer">
            <el-button size="mini" @click="handleCancelDeleteTag">{{ $t('no') }}</el-button>
            <el-button type="primary" size="mini" @click="handleConfirmDeleteTag(tag)">{{ $t('yes') }}</el-button>
          </footer>
        </el-popover>
      </el-tag>
    </li>
  </ul>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'RepoTags',
  props: {
    tags: { type: Array, required: true },
    repo: { type: Object, required: true }
  },
  methods: {
    ...mapMutations(['changeActiveTag']),
    handleDeleteTag () {
      document.body.click()
    },
    handleCancelDeleteTag () {
      document.body.click()
    },
    handleConfirmDeleteTag (tag) {
      document.body.click()
      this.$store.dispatch('deleteRepoCustomTag', { repoId: this.repo.id, tagId: tag.id })
    }
  }
}
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  font-size: 12px;
  list-style: none;
  color: #fff;
}

.tag-item {
  position: relative;
  margin-bottom: 0.3em;
  margin-right: 0.5em;
}

.tag-delete-btn {
  margin-left: -7px;
  line-height: 19px;
  cursor: pointer;
}

.tag-delete-btn:hover {
  font-size: 13px;
}
</style>
