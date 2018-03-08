<template>
  <li :class="{ active: tag.id === activeTag.id && !isEditingTags }" class="nav-item" @click="handleSwitchActiveTag">
    <slot></slot>
    <span v-show="!isCustomTag || !isEditingTags" class="nav-item-badge">{{ tag.repos.length }}</span>
  </li>
</template>

<script>
import { mapState } from 'vuex'
import { notifyInfo } from '@/helper'

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
      if (this.isEditingTags) return notifyInfo({ message: this.$t('canNotSwitchTagWhenEdit') })
      this.$store.commit('tag/switchActive', this.tag)
    },
  },
}
</script>

<style scoped>
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: none;
  height: 40px;
  padding: 0 15px;
  border-left: 3px solid transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  border-left-color: #7265e6;
  border-bottom-color: transparent;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item-badge {
  flex: none;
  padding: 0 0.8em;
  line-height: 1.8;
  border-radius: 1em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
}
</style>

<style>
#sidebar .nav-item .nav-item__label {
  display: flex;
  align-items: center;
  flex: auto;
  padding-right: 10px;
  line-height: 40px;
  cursor: inherit;
}

#sidebar .nav-item .nav-item__label .fa {
  flex: 0 0 15px;
  margin-top: 3px;
  margin-right: 5px;
}

#sidebar .nav-item .nav-item__name {
  flex: auto;
}
</style>
