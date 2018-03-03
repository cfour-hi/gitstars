<template>
  <ul class="nav-tags">
    <tag-nav v-for="tag of tags" :key="tag.id" :tag="tag"></tag-nav>
  </ul>
</template>

<script>
import TagNav from './TagNav'

export default {
  name: 'TagsNav',
  components: { TagNav },
  props: {
    tags: { type: Array, required: true },
  },
}
</script>
