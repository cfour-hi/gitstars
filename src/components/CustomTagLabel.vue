<template>
  <div class="nav-item__label slo" @dblclick="handleEditTagName">
    <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
    <span v-show="!isEditing" class="nav-item__name slo">{{ tag.name }}</span>
    <input
      v-show="isEditing"
      v-model="name"
      :ref="ref"
      type="text"
      class="nav-item__input--name"
      @blur="handleChangeTagNameByBlur"
      @keyup.enter="handleChangeTagNameByEnter"
      @keyup.esc="handleCancelEditTagName"
    />
  </div>
</template>

<script>
import { notifyWarn } from '@/helper'

let preName = ''
let isChangeTagNameByEnter = false

export default {
  name: 'custom-tag-label',
  props: {
    tag: { type: Object, required: true },
    isEditingTags: { type: Boolean, default: false },
  },
  data () {
    const { tag } = this
    return {
      isEditing: false,
      name: tag.name,
      ref: `tagNameEditInput${tag.id}`,
    }
  },
  methods: {
    handleEditTagName () {
      if (!this.isEditingTags) return

      preName = this.name
      this.isEditing = true
      this.$nextTick(() => this.$refs[this.ref].focus())
    },
    handleChangeTagNameByBlur () {
      if (isChangeTagNameByEnter) return (isChangeTagNameByEnter = false)

      this.$store.dispatch('tag/changeTagName', { tagId: this.tag.id, name: this.name })
        .then(() => (this.isEditing = false))
        .catch(() => {
          this.name = preName
          this.isEditing = false
        })
    },
    handleChangeTagNameByEnter () {
      if (this.name === this.tag.name) return (this.isEditing = false)

      this.$store.dispatch('tag/changeTagName', { tagId: this.tag.id, name: this.name })
        .then(() => {
          isChangeTagNameByEnter = true
          this.isEditing = false
        })
        .catch(({ message }) => notifyWarn(message))
    },
    handleCancelEditTagName () {
      this.isEditing = false
      this.name = preName
    },
  },
}
</script>
