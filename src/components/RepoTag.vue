<template>
  <li class="tag-item" @click.stop="!isEditingTags && $store.commit('changeActiveTag', tag)">
    <el-tag size="small" class="tag">
      <span>{{ tag.name }}</span>
      <i
        v-show="!isEditingTags"
        class="tag-delete-btn"
        @click.stop="$store.dispatch('deleteRepoCustomTag', { repoId: repo.id, tagId: tag.id })">
        &times;
      </i>
    </el-tag>
  </li>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RepoTag',
  props: {
    repo: { type: Object, required: true },
    tag: { type: Object, required: true },
  },
  computed: {
    ...mapState(['isEditingTags']),
  },
}
</script>

<style scoped>
.tag-item {
  position: relative;
  margin-bottom: 0.3em;
  margin-right: 0.5em;
}

.tag:hover {
  border-color: rgba(66, 161, 255, .5);
}

.tag-delete-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(66, 161, 255, .5);
  border-radius: 50%;
  font-size: 14px;
  line-height: 11px;
  text-align: center;
  font-style: normal;
  color: rgba(66, 161, 255, .5);
  background-color: #fff;
  cursor: pointer;
  transform: scale(0);
  transition: transform .15s;
}

.tag-delete-btn:hover {
  color: #fff;
  background-color: rgba(66, 161, 255, .8);
}

.tag:hover .tag-delete-btn {
  transform: scale(1);
}

.tag-delete-btn:hover {

}
</style>
