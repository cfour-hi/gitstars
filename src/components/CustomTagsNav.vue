<template>
  <draggable :list="customTags" :options="dragOptions" class="custom-tags">
    <transition-group name="tag-nav" tag="ul" class="tags-nav">
      <tag-nav-wrap v-for="tag of customTags" :key="tag.id" :tag="tag" is-custom-tag>
        <custom-tag-label :tag="tag" :isEditingTags="isEditingTags"></custom-tag-label>
        <custom-tag-delete-btn :visible="isEditingTags" :tag="tag"></custom-tag-delete-btn>
      </tag-nav-wrap>
    </transition-group>
  </draggable>
</template>

<script>
import { mapState } from 'vuex'
import Draggable from 'vuedraggable'
import TagNavWrap from './TagNavWrap'
import CustomTagLabel from './CustomTagLabel'
import CustomTagDeleteBtn from './CustomTagDeleteBtn'

export default {
  name: 'cutom-tags-nav',
  components: { Draggable, TagNavWrap, CustomTagLabel, CustomTagDeleteBtn },
  computed: {
    ...mapState(['isEditingTags']),
    customTags: {
      get () {
        return this.$store.state.tag.tags
      },
      set (value) {
        this.$store.commit('tag/initTags', value)
      },
    },
    dragOptions () {
      return { disabled: !this.isEditingTags }
    },
  },
}
</script>
