<template>
  <ul class="nav-tag">
    <tag-nav v-for="tag of tags" :key="tag.id" :tag="tag" :isEditingTags="isEditingTags"></tag-nav>
  </ul>
</template>

<script>
import TagNav from './TagNav'

export default {
  name: 'TagsNav',
  components: { TagNav },
  props: {
    tags: { type: Array, required: true },
    isEditingTags: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.nav-tag {
  display: flex;
  flex-direction: column;
  flex: none;
  padding-left: 0;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
}
</style>
