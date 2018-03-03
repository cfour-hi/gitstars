<template>
  <li :class="{ active: tag.id === activeTag.id && !isEditingTags }" class="nav-item" @click="handleSwitchActiveTag">
    <template v-if="editable">
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
          @keyup.esc="handleCancelEditTagName">
      </div>
      <el-popover :title="`${$t('areYouSure')}？`" placement="right">
        <i v-show="isEditingTags" slot="reference" class="fa fa-times-circle" aria-hidden="true" @click.stop="handleDeleteTag"></i>
        <footer class="popover-footer">
          <el-button size="mini" @click="handleCancelDeleteTag">{{ $t('no') }}</el-button>
          <el-button type="primary" size="mini" @click="handleConfirmDeleteTag">{{ $t('yes') }}</el-button>
        </footer>
      </el-popover>
    </template>
    <template v-else>
      <div class="nav-item__label slo">
        <i :class="`${tag.icon || 'fa-tag'}`" class="fa fa-fw" aria-hidden="true"></i>
        <span>{{ tag.name || $t(tag.i18nKey) }}</span>
      </div>
    </template>
    <span v-show="!isEditingTags || !editable" class="nav-item-badge">{{ tag.repos.length }}</span>
  </li>
</template>

<script>
import { mapState } from 'vuex'
import appConfig from '../config'

let preName = ''
let isChangeTagNameByEnter = false

export default {
  name: 'TagNav',
  props: {
    tag: { type: Object, required: true },
    editable: { type: Boolean, default: false },
  },
  data () {
    const { tag } = this
    return {
      name: tag.name,
      isEditing: false,
      ref: `tagNameEditInput${tag.id}`,
    }
  },
  computed: {
    ...mapState(['activeTag', 'isEditingTags']),
  },
  methods: {
    handleSwitchActiveTag () {
      if (this.isEditingTags) {
        if (!this.editable) this.$notify.warning(Object.assign({ message: this.$t('canNotSwitchTagWhenEdit') }, appConfig.notify))
        return
      }
      this.$store.commit('changeActiveTag', this.tag)
    },
    handleEditTagName () {
      if (!this.isEditingTags) return
      preName = this.name
      this.isEditing = true
      this.$nextTick(() => this.$refs[this.ref].focus())
    },
    handleChangeTagNameByBlur () {
      if (isChangeTagNameByEnter) return (isChangeTagNameByEnter = false)

      this.$store.dispatch('changeCustomTagName', { tagId: this.tag.id, name: this.name })
        .then(() => (this.isEditing = false))
        .catch(() => {
          this.name = preName
          this.isEditing = false
        })
    },
    handleChangeTagNameByEnter () {
      if (this.name === this.tag.name) return (this.isEditing = false)

      this.$store.dispatch('changeCustomTagName', { tagId: this.tag.id, name: this.name })
        .then(() => {
          isChangeTagNameByEnter = true
          this.isEditing = false
        })
        .catch(({ message }) => this.$notify.warning(Object.assign({ message }, appConfig.notify)))
    },
    handleCancelEditTagName () {
      this.isEditing = false
      this.name = preName
    },
    handleDeleteTag () {
      document.body.click()
    },
    handleCancelDeleteTag () {
      document.body.click()
    },
    handleConfirmDeleteTag () {
      document.body.click()
      this.$store.commit('deleteCustomTag', this.tag.id)
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

.nav-item__label {
  display: flex;
  align-items: center;
  flex: auto;
  padding-right: 10px;
  line-height: 40px;
  cursor: inherit;
}

.nav-item__label .fa {
  flex: 0 0 15px;
  margin-top: 3px;
  margin-right: 5px;
}

.nav-item__name {
  flex: auto;
}

.nav-item__input--name {
  box-shadow: border-box;
  width: 100%;
  border: none;
  line-height: 1.5;
  color: #fff;
  background-color: transparent;
  outline: none;
}

.nav-item-badge {
  flex: none;
  padding: 0 0.8em;
  line-height: 1.8;
  border-radius: 1em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.fa-times-circle {
  font-size: 16px;
  transition: all 0.1s;
  cursor: pointer;
}

.fa-times-circle:hover {
  transform: scale(1.5);
}
</style>
