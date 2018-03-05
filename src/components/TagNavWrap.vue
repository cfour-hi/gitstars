<template>
  <li :class="{ active: tag.id === activeTag.id && !isEditingTags }" class="nav-item" @click="handleSwitchActiveTag">
    <slot></slot>
    <span v-show="!isCustomTag || !isEditingTags" class="nav-item-badge">{{ tag.repos.length }}</span>
  </li>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'tag-nav-wrap',
  props: {
    tag: { type: Object, required: true },
    isCustomTag: { type: Boolean, default: false },
  },
  computed: {
    ...mapState(['isEditingTags']),
    ...mapState('tag', { activeTag: 'active' }),
  },
  methods: {
    handleSwitchActiveTag () {
      if (this.isEditingTags) return
      this.$store.commit('tag/switchActive', this.tag)
    },
  },
}
</script>
