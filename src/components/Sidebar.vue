<template>
  <section id="sidebar">
    <header>
      <h1 style="display: none;">Github Stars Manager</h1>
      <a href="https://github.com/Monine/gitstars" target="_blank">
        <img src="../assets/app-name.png" alt="app name" class="app-name-img">
      </a>
    </header>
    <ul class="nav-tag">
      <li
        v-for="tag in defaultTags"
        :key="tag.id" :class="{ active: tag.id === currentTag.id }"
        class="nav-item"
        @click="handleSwitchTag(tag)">
        <label class="nav-item__label">
          <i :class="tag.icon" class="fa fa-fw" aria-hidden="true"></i>
          <span>{{ $t(tag.i18nKey) }}</span>
        </label>
        <span class="nav-item-badge">{{ tag.number }}</span>
      </li>
    </ul>
    <div class="tag-nav">
      <header class="nav-caption">
        <h3 class="nav-caption__title">
          <i class="fa fa-fw fa-tags" aria-hidden="true"></i>
          <span>{{ $t('tags').toUpperCase() }}</span>
        </h3>
        <transition name="slide-to-left">
          <div v-show="currentTagCategory.id === tagCategorys.custom.id" class="nav-caption__operate">
            <div :class="{ disabled: isEditTag || tagNameFormVisible }" class="nav-caption__operate-btn" @click="handleAddNewTag">
              <span>
                <i class="fa fa-plus-square" aria-hidden="true"></i>
                {{ $t('add') }}
              </span>
            </div>
            <transition-group name="enlarge" tag="div" class="nav-caption__group--edit-ok">
              <div
                v-show="isEditTag"
                key="ok"
                class="nav-caption__operate-btn nav-caption__ok-btn"
                @click="handleCompleteEditTags">
                <span>{{ $t('ok').toUpperCase() }}</span>
              </div>
              <div
                v-show="!isEditTag"
                :class="{ disabled: tagNameFormVisible }"
                key="edit"
                class="nav-caption__operate-btn"
                @click="handleEditTags">
                <span>
                  <i class="fa fa-cog" aria-hidden="true"></i>
                  {{ $t('edit.default') }}
                </span>
              </div>
            </transition-group>
          </div>
        </transition>
      </header>
      <transition name="slide-down">
        <form v-show="tagNameFormVisible" class="tag-form" onsubmit="return false">
          <input
            v-model="tagName"
            :class="tagNameInputState"
            :placeholder="`${$t('tagName')}`"
            ref="tagFormNameInput"
            type="text"
            class="tag-form__input--name"
            @input="handleInputTagName"
            @focus="handleFocusTagName"
            @blur="handleBlurTagName"
            @keyup.enter.prevent="handleAddTag"
            @keyup.esc="handleCancelAddTag">
            <div class="tag-form__operate" :class="tagNameBtnState">
              <button
                type="button"
                class="tag-form__operate-btn save"
                @click="handleAddTag">
                {{ $t('save').toUpperCase() }}
              </button>
              <button
                type="button"
                class="tag-form__operate-btn cancel"
                @click="handleCancelAddTag">
                {{ $t('cancel').toUpperCase() }}
              </button>
            </div>
        </form>
      </transition>
      <transition name="slide-down">
        <div v-show="isEditTag" class="edit-tag-tip">{{ $t('tips.editTag') }}</div>
      </transition>
      <div class="tag-list__group">
        <transition name="slide-to-left">
          <draggable
            v-show="currentTagCategory.id === tagCategorys.custom.id"
            :list="dragTags"
            :options="dragOptions"
            :class="{ edit: isEditTag }"
            class="draggable-tags">
            <transition-group name="tag-list" tag="ul" class="nav-tag tag-list">
              <li
                v-for="(tag, index) of dragTags"
                :key="tag.id"
                :class="{ active: tag.id === currentTag.id }"
                class="nav-item"
                @click="handleSwitchTag(tag)">
                <div class="nav-item__label slo" @dblclick="handleEditTagName(tag)">
                  <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
                  <span v-show="!tag._isEdit" class="nav-item__name slo">{{ tag.name }}</span>
                  <input
                    v-show="tag._isEdit"
                    :ref="tag._ref"
                    :value="tag.name"
                    type="text"
                    class="nav-item__input--name"
                    @blur="handleChangeTagNameByBlur(tag)"
                    @keyup.enter="handleChangeTagNameByEnter(tag)"
                    @keyup.esc="handleCancelEditTagName(tag)">
                </div>
                <el-popover :title="`${$t('areYouSure')}？`" placement="right">
                  <i v-show="isEditTag" slot="reference" class="fa fa-times-circle" aria-hidden="true" @click.stop="handleDeleteTag"></i>
                  <footer class="popover-footer">
                    <el-button size="mini" @click="handleCancelDeleteTag">
                      {{ $t('no') }}
                    </el-button>
                    <el-button type="primary" size="mini" @click="handleConfirmDeleteTag(tag, index)">
                      {{ $t('yes') }}
                    </el-button>
                  </footer>
                </el-popover>
                <span v-show="!isEditTag" class="nav-item-badge">{{ tag.repos.length }}</span>
              </li>
            </transition-group>
          </draggable>
        </transition>
        <transition name="slide-to-right">
          <ul v-show="currentTagCategory.id === tagCategorys.language.id" class="nav-tag tag-list">
            <li
              v-for="tag of tagCategorys.language.tags"
              :key="tag.id"
              :class="{ active: tag.id === currentTag.id }"
              class="nav-item"
              @click="handleSwitchTag(tag)">
              <label class="nav-item__label slo">
                <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
                <span class="nav-item__name slo">{{ tag.name }}</span>
              </label>
              <span v-show="!isEditTag" class="nav-item-badge">{{ tag.repos.length }}</span>
            </li>
          </ul>
        </transition>
      </div>
      <transition name="telescopic">
        <div
          v-show="!tagCategorys.custom.tags.length && currentTagCategory.id === tagCategorys.custom.id"
          class="no-tag vc-p">
          <i class="fa fa-hand-o-up fa-2x" aria-hidden="true"></i>
          <p>{{ $t('addTag') }}</p>
        </div>
      </transition>
    </div>
    <transition name="slide-up">
      <ul v-show="!isEditTag && !tagNameFormVisible" class="tag-category">
        <li :style="categoryTagSliderStyle" class="tag-category__slider"></li>
        <li
          v-for="(category, key) in tagCategorys"
          :key="key"
          :class="{ active: category.id === currentTagCategory.id }"
          class="tag-category__item"
          @click="$emit('switchTagCategory', { category })">
          {{ $t(category.i18nKey) }}
        </li>
      </ul>
    </transition>
    <footer class="sidebar-footer">
      <span>Author&nbsp;:&nbsp;</span>
      <h1 class="author"><a href="https://github.com/Monine" target="_blank" class="author-name">Monine</a></h1>
    </footer>
  </section>
</template>

<script>
import draggable from 'vuedraggable'
import config from '../config'

let isValidatedNewTagName = false
let dragTagsClone = []

const { norifyPosition, defaultTags } = config

const SAVE = 'save'
const CANCEL = 'cancel'
const FOCUS = 'focus'
const BLUR = 'blur'

function tranformTags (tags = {}) {
  const dragTags = JSON.parse(JSON.stringify(tags))

  dragTags.forEach((tag, index) => {
    tag._isEdit = false
    tag._ref = `tagNameEditInput${tag.id}`
    tag._preName = ''
  })

  return dragTags
}

export default {
  name: 'sidebar',
  components: { draggable },
  props: {
    starredReposLen: { required: true, type: Number },
    untaggedReposLen: { required: true, type: Number },
    currentTag: { required: true, type: Object },
    tagCategorys: { required: true, type: Object },
    currentTagCategory: { required: true, type: Object }
  },
  data () {
    return {
      tagNameFormVisible: false,
      tagName: '',
      tagNameInputState: FOCUS,
      tagNameBtnState: CANCEL,
      isEditTag: false,
      dragTags: tranformTags(this.tagCategorys.custom.tags)
    }
  },
  computed: {
    defaultTags () {
      const tags = JSON.parse(JSON.stringify(defaultTags))
      tags.all.number = this.starredReposLen
      tags.untagged.number = this.untaggedReposLen
      return tags
    },
    dragOptions () {
      return { disabled: !this.isEditTag }
    },
    categoryTagSliderStyle () {
      const values = Object.values(this.tagCategorys)
      const slidebarWidth = 100 / values.length
      const index = values.findIndex(value => value.id === this.currentTagCategory.id)

      return {
        left: `${index * slidebarWidth}%`,
        width: `${slidebarWidth}%`
      }
    }
  },
  watch: {
    'tagCategorys.custom.tags': {
      deep: true,
      handler (newVal) {
        this.dragTags = tranformTags(newVal)
      }
    }
  },
  created () {
    this.$emit('switchTag', { tag: this.defaultTags.all })
  },
  destroyed () {
    dragTagsClone = []
  },
  methods: {
    handleSwitchTag (tag) {
      const { id } = tag

      if (id === this.currentTag.id) return

      if (this.isEditTag) {
        if (Object.values(this.defaultTags).find(tag => tag.id === id)) {
          return this.$notify.warning({
            message: this.$t('canNotSwitchTagWhenEdit'),
            showClose: false,
            position: norifyPosition
          })
        }
        return
      }

      this.$emit('switchTag', { tag })
    },
    handleAddNewTag () {
      if (this.isEditTag || this.tagNameFormVisible) return

      this.tagNameFormVisible = true
      this.$nextTick(() => this.$refs.tagFormNameInput.focus())
    },
    handleInputTagName () {
      this.tagNameBtnState = this.tagName.trim().length ? SAVE : CANCEL
    },
    handleFocusTagName () {
      this.tagNameInputState = FOCUS
    },
    handleBlurTagName () {
      this.tagNameInputState = BLUR
    },
    handleAddTag () {
      let message = ''
      const tagName = this.tagName.trim()

      if (!tagName) message = this.$t('tagNameCannotEmpty')

      if (this.tagCategorys.custom.tags.find(({ name }) => name === tagName)) {
        message = this.$t('tagNameAlreadyExist')
      }

      if (message) {
        this.$notify.warning({ message, showClose: false, position: norifyPosition })
        return this.$refs.tagFormNameInput.focus()
      }

      this.$emit('saveNewTag', tagName)
      this.handleCancelAddTag()
    },
    handleCancelAddTag () {
      this.tagNameFormVisible = false
      this.tagNameBtnState = CANCEL
      this.tagName = ''
    },
    handleEditTags () {
      if (this.tagNameFormVisible) return

      this.isEditTag = true
      dragTagsClone = JSON.parse(JSON.stringify(this.dragTags))

      this.$emit('editTags')
    },
    handleEditTagName (tag) {
      if (!this.isEditTag) return

      this.dragTags.forEach(tag => (tag._isEdit = false))

      tag._isEdit = true
      tag._preName = tag.name

      this.$nextTick(() => this.$refs[tag._ref][0].focus())
    },
    handleChangeTagNameByBlur (tag) {
      const $input = this.$refs[tag._ref][0]
      const newTagName = $input.value.trim()

      if (!isValidatedNewTagName) {
        if (!newTagName) {
          tag.name = tag._preName
          tag._isEdit = false
          return
        }

        if (this.dragTags.find(dragTag => (
          dragTag.name === newTagName &&
          dragTag !== tag
        ))) {
          this.$notify.warning({
            message: this.$t('tagNameAlreadyExist'),
            showClose: false,
            position: norifyPosition
          })

          return $input.focus()
        }
      }

      isValidatedNewTagName = false
      tag.name = newTagName
      tag._preName = ''
      tag._isEdit = false

      this.$emit('changeTagName', { id: tag.id, name: newTagName })
    },
    handleChangeTagNameByEnter (tag) {
      let message = ''
      const $input = this.$refs[tag._ref][0]
      const newTagName = $input.value.trim()

      if (!newTagName) message = this.$t('tagNameCannotEmpty')

      if (this.dragTags.find(dragTag => (
        dragTag.name === newTagName &&
        dragTag !== tag
      ))) {
        message = this.$t('tagNameAlreadyExist')
      }

      if (message) {
        this.$notify.warning({ message, showClose: false, position: norifyPosition })
        return $input.focus()
      }

      isValidatedNewTagName = true
      $input.blur()
    },
    handleCancelEditTagName (tag) {
      tag.name = tag._preName
      tag._preName = ''
      tag._isEdit = false
    },
    handleDeleteTag () {
      document.body.click()
    },
    handleConfirmDeleteTag (tag, index) {
      this.dragTags.splice(index, 1)
      this.$emit('deleteTag', { tag })
      document.body.click()
    },
    handleCancelDeleteTag () {
      document.body.click()
    },
    handleCompleteEditTags () {
      this.isEditTag = false

      let isChanged = false
      for (const [index, { id, name }] of dragTagsClone.entries()) {
        const tag = this.dragTags[index]
        if (!tag || id !== tag.id || name !== tag.name) {
          isChanged = true
          break
        }
      }

      if (!isChanged) return

      const tags = this.dragTags.map(({ id, name, repos }) => ({ id, name, repos }))
      this.$emit('completeEditTags', tags)
    }
  }
}
</script>

<style scoped>
#sidebar {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 0 0 250px;
  height: 100%;
  color: #d9d9d9;
  background-color: #28343d;
}

@media (min-width: 1500px) {
  #sidebar {
    flex: 0 0 290px;
  }
}

.app-name-img {
  width: 100%;
  padding: 10px 0;
}

.nav-tag {
  display: flex;
  flex-direction: column;
  flex: none;
  padding-left: 0;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
}

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

.nav-item:hover,
.nav-caption__operate-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active,
.nav-caption__operate-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  border-left-color: #7265e6;
  border-bottom-color: transparent;
}

.nav-item.sortable-chosen {
  background-color: rgba(255, 255, 255, 0.2);
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

.edit-tag-tip {
  overflow: hidden;
  height: 24px;
  font-size: 12px;
  line-height: 2;
  text-align: center;
  color: #919191;
  background-color: rgba(255, 255, 255, 0.1);
}

.tag-list__group {
  overflow-y: auto;
  overflow-x: hidden;
  flex: auto;
  position: relative;
}

.tag-list__group .tag-list,
.tag-list__group .draggable-tags {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.draggable-tags::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.3);
}

.draggable-tags.edit .nav-item {
  cursor: move;
}

.draggable-tags.edit .nav-item.active {
  border-left-color: transparent;
  border-bottom-color: rgba(255, 255, 255, 0.08);
  background-color: transparent;
}

.nav-item-badge {
  flex: none;
  padding: 0 0.8em;
  line-height: 1.8;
  border-radius: 1em;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.tag-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: auto;
}

.nav-caption {
  display: flex;
  justify-content: space-between;
  flex: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  transition: all 0.3s;
}

.nav-caption__title {
  flex: auto;
  font-size: 14px;
  padding-left: 1em;
  color: #919191;
}

.nav-caption__operate {
  display: flex;
  flex: 0 0 140px;
}

.nav-caption__group--edit-ok {
  display: flex;
  flex: auto;
}

.nav-caption__operate-btn {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 0 0 49px;
  padding: 0 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  text-transform: capitalize;
  cursor: pointer;
  user-select: none;
}

.nav-caption__operate-btn .fa {
  margin-right: 3px;
}

.nav-caption__operate-btn.disabled {
  color: #919191;
  cursor: default;
}

.nav-caption__operate-btn.disabled:hover {
  background-color: transparent;
}

.nav-caption__ok-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-caption__ok-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-caption__ok-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.tag-form {
  display: flex;
  flex: none;
  height: 38px;
  font-size: 12px;
}
.tag-form__input--name {
  flex: auto;
  box-sizing: border-box;
  padding: 0 15px;
  border: none;
  line-height: 1.5;
  outline: none;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.tag-form__input--name:focus {
  color: #28343d;
  background-color: #fff;
}

.tag-form__input--name.blur {
  color: #d9d9d9;
}

.tag-form__operate {
  flex: 0 0 70px;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.tag-form__operate-btn {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  text-align: center;
  color: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease-out 0.1s;
}

.tag-form__operate-btn.save {
  background-color: #3dbd7d;
}

.tag-form__operate-btn.save:active {
  background-color: #39b175;
}

.tag-form__operate.save .save {
  margin-left: 0;
}

.tag-form__operate.save .cancel {
  margin-left: 100%;
}

.tag-form__operate-btn.cancel {
  background-color: #697178;
}

.tag-form__operate-btn.cancel:active {
  background-color: #616970;
}

.tag-form__operate.cancel .save {
  margin-left: -100%;
}

.tag-form__operate.cancel .cancel {
  margin-left: 0;
}

.tag-list {
  overflow: auto;
  flex: auto;
  border-top: none;
}

.fa-times-circle {
  font-size: 16px;
  transition: all 0.1s;
  cursor: pointer;
}

.fa-times-circle:hover {
  transform: scale(1.5);
}

.tag-list-enter,
.tag-list-leave-active {
  transform: translateX(-100%);
}

.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.3s;
}

.no-tag {
  font-size: 14px;
  text-align: center;
  color: #919191;
}

.tag-category {
  display: flex;
  flex: 0 0 29px;
  position: relative;
  padding-left: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0;
  font-size: 12px;
  line-height: 30px;
  text-align: center;
  list-style: none;
  color: #919191;
  cursor: pointer;
}

.tag-category__slider {
  position: absolute;
  height: 100%;
  border-top: 1px solid #7265e6;
  background-color: rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
}

.tag-category__item {
  width: 50%;
  margin: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: capitalize;
  transition: all 0.3s;
}

.tag-category__item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.tag-category__item.active {
  color: #d9d9d9;
}

.tag-category__item:last-child {
  border-right: none;
}

.sidebar-footer {
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 29px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  text-align: center;
  font-weight: 700;
  color: #919191;
  background-color: #28343d;
}

.author {
  font-size: inherit;
}

.author-name {
  color: inherit;
}
</style>

<style>
#appName a {
  color: #fff;
}

#appName a:hover {
  text-decoration: none;
}
</style>
