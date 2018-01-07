<template>
  <section id="sidebar">
    <header>
      <h1 style="display: none;">Github Stars Manager</h1>
      <a href="https://github.com/Monine/gitstars" target="_blank">
        <img src="../assets/app-name.png" alt="app name" class="app-name-img">
      </a>
    </header>
    <ul class="nav-label">
      <li
        v-for="label of defaultLabels"
        :key="label.id" :class="{ active: label.id === currentLabel.id }"
        class="nav-item"
        @click="handleToggleLabel(label)">
        <label class="nav-item__label">
          <i :class="label.icon" class="fa fa-fw" aria-hidden="true"></i>
          <span>{{ label.name }}</span>
        </label>
        <span class="nav-item-badge">{{ label.id ? unlabeledReposLen : starredReposLen }}</span>
      </li>
    </ul>
    <div class="label-nav">
      <header class="nav-caption">
        <h3 class="nav-caption__title">
          <i class="fa fa-fw fa-tags" aria-hidden="true"></i>
          <span>标签</span>
        </h3>
        <transition name="slide-to-left">
          <div v-show="labelCategoryIndex === 0" class="nav-caption__operate">
            <div :class="{ disabled: isEditLabel || labelNameFormVisible }" class="nav-caption__operate-btn" @click="handleAddNewLabel">
              <i class="fa fa-plus-square" aria-hidden="true"></i>
              <span>添加</span>
            </div>
            <transition-group name="enlarge" tag="div" class="nav-caption__group--edit-over">
              <div
                v-show="isEditLabel"
                key="over"
                class="nav-caption__operate-btn nav-caption__complete-btn"
                @click="handleCompleteEditLabels">
                完成
              </div>
              <div
                v-show="!isEditLabel"
                :class="{ disabled: labelNameFormVisible }"
                key="edit"
                class="nav-caption__operate-btn"
                @click="handleEditLabels">
                <i class="fa fa-cog" aria-hidden="true"></i>
                <span>编辑</span>
            </div>
            </transition-group>
          </div>
        </transition>
      </header>
      <transition name="slide-down">
        <form v-show="labelNameFormVisible" class="label-form" onsubmit="return false">
          <input
            v-model="labelName"
            :class="labelNameInputState"
            ref="labelFormNameInput"
            type="text"
            class="label-form__input--name"
            placeholder="标签名称"
            @input="handleInputLabelName"
            @focus="handleFocusLabelName"
            @blur="handleBlurLabelName"
            @keyup.enter.prevent="handleAddLabel"
            @keyup.esc="handleCancelAddLabel">
            <div class="label-form__operate" :class="labelNameBtnState">
              <button type="button" class="label-form__operate-btn save" @click="handleAddLabel">SAVE</button>
              <button type="button" class="label-form__operate-btn cancel" @click="handleCancelAddLabel">CANCEL</button>
            </div>
        </form>
      </transition>
      <transition name="slide-down">
        <div v-show="isEditLabel" class="edit-label-tip">双击标签修改名称，拖拽标签排列顺序</div>
      </transition>
      <div class="label-list__group">
        <transition name="slide-to-left">
          <draggable v-show="labelCategoryIndex === 0" :list="dragLabels" :options="dragOptions" :class="{ edit: isEditLabel }" class="draggable-labels">
            <transition-group name="label-list" tag="ul" class="nav-label label-list">
              <li
                v-for="(label, index) of dragLabels"
                :key="label.id"
                :class="{ active: label.id === currentLabel.id }"
                class="nav-item"
                @click="handleToggleLabel(label)">
                <div class="nav-item__label slo" @dblclick="handleEditLabelName(label)">
                  <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
                  <span v-show="!label._isEdit" class="nav-item__name slo">{{ label.name }}</span>
                  <input
                    v-show="label._isEdit"
                    :ref="label._ref" type="text"
                    :value="label.name"
                    class="nav-item__input--name"
                    @blur="handleChangeLabelNameByBlur(label)"
                    @keyup.enter="handleChangeLabelNameByEnter(label)"
                    @keyup.esc="handleCancelEditLabelName(label)">
                </div>
                <el-popover placement="right" title="Are you sure?">
                  <i v-show="isEditLabel" slot="reference" class="fa fa-times-circle" aria-hidden="true" @click.stop="handleDeleteLabel"></i>
                  <footer class="popover-footer">
                    <el-button size="mini" @click="handleCancelDeleteLabel">No</el-button>
                    <el-button type="primary" size="mini" @click="handleConfirmDeleteLabel(label, index)">Yes</el-button>
                  </footer>
                </el-popover>
                <span v-show="!isEditLabel" class="nav-item-badge">{{ label.repos.length }}</span>
              </li>
            </transition-group>
          </draggable>
        </transition>
        <transition name="slide-to-right">
          <ul v-show="labelCategoryIndex === 1" class="nav-label label-list">
            <li
              v-for="label of languageLabels"
              :key="label.id"
              :class="{ active: label.id === currentLabel.id }"
              class="nav-item"
              @click="handleToggleLabel(label)">
              <label class="nav-item__label slo">
                <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
                <span class="nav-item__name slo">{{ label.name }}</span>
              </label>
              <span v-show="!isEditLabel" class="nav-item-badge">{{ label.repos.length }}</span>
            </li>
          </ul>
        </transition>
      </div>
      <transition name="telescopic">
        <div v-show="!customLabels.length && labelCategoryIndex === 0" class="no-label vc-p">
          <i class="fa fa-hand-o-up fa-2x" aria-hidden="true"></i>
          <p>添加标签</p>
        </div>
      </transition>
    </div>
    <transition name="slide-up">
      <ul v-show="!isEditLabel && !labelNameFormVisible" class="label-category">
        <li :style="categoryLabelSliderStyle" class="label-category__slider"></li>
        <li
          v-for="(category, index) of labelCategorys"
          :key="category"
          :class="{ active: index === labelCategoryIndex }"
          class="label-category__item"
          @click="$emit('toggleLabelCategory', { index })">
          {{ category }}
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
import constants from '../constants'

let isValidatedNewLabelName = false
let dragLabelsClone = []

const { norifyPosition } = config
const { LABEL_NAME_CANNOT_ENPTY, LABEL_NAME_ALREADY_EXIST } = constants
const SAVE = 'save'
const CANCEL = 'cancel'
const FOCUS = 'focus'
const BLUR = 'blur'

const tranformLabels = function tranformLabels (labels = {}) {
  const dragLabels = JSON.parse(JSON.stringify(labels))

  dragLabels.forEach((label, index) => {
    label._isEdit = false
    label._ref = `labelNameEditInput${label.id}`
    label._preName = ''
  })
  return dragLabels
}

export default {
  name: 'sidebar',
  components: { draggable },
  props: {
    starredReposLen: { type: Number, default: 0 },
    unlabeledReposLen: { type: Number, default: 0 },
    customLabels: { type: Array, default: [] },
    languageLabels: { type: Array, default: [] },
    currentLabel: { type: Object, default: {} },
    labelCategoryIndex: { type: Number, default: 0 }
  },
  data () {
    return {
      defaultLabels: [
        { id: 0, name: '全部', icon: 'fa-bars' },
        { id: -1, name: '未标签', icon: 'fa-star-o' }
      ],
      labelNameFormVisible: false,
      labelName: '',
      labelNameInputState: FOCUS,
      labelNameBtnState: CANCEL,
      isEditLabel: false,
      dragLabels: tranformLabels(this.customLabels),
      labelCategorys: ['自定义', '语言']
    }
  },
  computed: {
    dragOptions () {
      return { disabled: !this.isEditLabel }
    },
    categoryLabelSliderStyle () {
      const slidebarWidth = 100 / this.labelCategorys.length
      return {
        left: `${this.labelCategoryIndex * slidebarWidth}%`,
        width: `${slidebarWidth}%`
      }
    }
  },
  watch: {
    customLabels: {
      deep: true,
      handler (newVal) {
        this.dragLabels = tranformLabels(newVal)
      }
    }
  },
  created () {
    this.$emit('toggleLabel', { label: this.defaultLabels[0] })
  },
  destroyed () {
    dragLabelsClone = []
  },
  methods: {
    handleToggleLabel (label) {
      if (this.isEditLabel) return
      this.$emit('toggleLabel', { label })
    },
    handleAddNewLabel () {
      if (this.isEditLabel || this.labelNameFormVisible) return

      this.labelNameFormVisible = true
      this.$nextTick(() => this.$refs.labelFormNameInput.focus())
    },
    handleInputLabelName () {
      this.labelNameBtnState = this.labelName.trim().length ? SAVE : CANCEL
    },
    handleFocusLabelName () {
      this.labelNameInputState = FOCUS
    },
    handleBlurLabelName () {
      this.labelNameInputState = BLUR
    },
    handleAddLabel () {
      let message = ''
      const labelName = this.labelName.trim()

      if (!labelName) message = LABEL_NAME_CANNOT_ENPTY
      if (this.customLabels.find(({ name }) => name === labelName)) message = LABEL_NAME_ALREADY_EXIST
      if (message) {
        this.$notify.warning({ message, showClose: false, position: norifyPosition })
        return this.$refs.labelFormNameInput.focus()
      }

      this.$emit('saveNewLabel', labelName)
      this.labelNameFormVisible = false
      this.labelNameBtnState = CANCEL
      this.labelName = ''
    },
    handleCancelAddLabel () {
      this.labelNameFormVisible = false
      this.labelNameBtnState = CANCEL
      this.labelName = ''
    },
    handleEditLabels () {
      if (this.labelNameFormVisible) return

      this.isEditLabel = true
      dragLabelsClone = JSON.parse(JSON.stringify(this.dragLabels))
      this.$emit('editLabels')
    },
    handleEditLabelName (label) {
      if (!this.isEditLabel) return

      this.dragLabels.forEach(label => (label._isEdit = false))
      label._isEdit = true
      label._preName = label.name
      this.$nextTick(() => this.$refs[label._ref][0].focus())
    },
    handleChangeLabelNameByBlur (label) {
      const $input = this.$refs[label._ref][0]
      const newLabelName = $input.value.trim()

      if (!isValidatedNewLabelName) {
        if (!newLabelName) {
          label.name = label._preName
          label._isEdit = false
          return
        }

        if (this.dragLabels.find(dragLabel => (dragLabel.name === newLabelName && dragLabel !== label))) {
          this.$notify.warning({
            message: LABEL_NAME_ALREADY_EXIST,
            showClose: false,
            position: norifyPosition
          })
          return $input.focus()
        }
      }

      isValidatedNewLabelName = false
      label.name = newLabelName
      label._preName = ''
      label._isEdit = false
      this.$emit('changeLabelName', { id: label.id, name: newLabelName })
    },
    handleChangeLabelNameByEnter (label) {
      let message = ''
      const $input = this.$refs[label._ref][0]
      const newLabelName = $input.value.trim()

      if (!newLabelName) message = LABEL_NAME_CANNOT_ENPTY
      if (this.dragLabels.find(dragLabel => (dragLabel.name === newLabelName && dragLabel !== label))) message = LABEL_NAME_ALREADY_EXIST
      if (message) {
        this.$notify.warning({ message, showClose: false, position: norifyPosition })
        return $input.focus()
      }

      isValidatedNewLabelName = true
      $input.blur()
    },
    handleCancelEditLabelName (label) {
      label.name = label._preName
      label._preName = ''
      label._isEdit = false
    },
    handleDeleteLabel () {
      document.body.click()
    },
    handleConfirmDeleteLabel (label, index) {
      this.$emit('deleteLabel', { index, label })
      document.body.click()
    },
    handleCancelDeleteLabel () {
      document.body.click()
    },
    handleCompleteEditLabels () {
      this.isEditLabel = false

      let isChanged = false
      for (const [index, { id, name }] of dragLabelsClone.entries()) {
        const label = this.dragLabels[index]
        if (!label || id !== label.id || name !== label.name) {
          isChanged = true
          break
        }
      }
      if (!isChanged) return

      const labels = this.dragLabels.map(({ id, name, repos }) => ({ id, name, repos }))
      this.$emit('completeEditLabels', labels)
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

.app-name-img {
  width: 100%;
  padding: 10px 0;
}

.nav-label {
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

.edit-label-tip {
  overflow: hidden;
  height: 24px;
  font-size: 12px;
  line-height: 2;
  text-align: center;
  color: #919191;
  background-color: rgba(255, 255, 255, 0.1);
}

.label-list__group {
  overflow-y: auto;
  overflow-x: hidden;
  flex: auto;
  position: relative;
}

.label-list__group .label-list,
.label-list__group .draggable-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.draggable-labels::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.3);
}

.draggable-labels.edit .nav-item {
  cursor: move;
}

.draggable-labels.edit .nav-item.active {
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

.label-nav {
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
  transition: all 0.3s;
}

.nav-caption__operate {
  display: flex;
  flex: 0 0 140px;
}

.nav-caption__group--edit-over {
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
  cursor: pointer;
  user-select: none;
}

.nav-caption__operate-btn.disabled {
  color: #919191;
  cursor: default;
}

.nav-caption__operate-btn.disabled:hover {
  background-color: transparent;
}

.nav-caption__complete-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-caption__complete-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-caption__complete-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.label-form {
  display: flex;
  flex: none;
  height: 38px;
  font-size: 12px;
}
.label-form__input--name {
  flex: auto;
  box-sizing: border-box;
  padding: 0 15px;
  border: none;
  line-height: 1.5;
  outline: none;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.label-form__input--name:focus {
  color: #28343d;
  background-color: #fff;
}

.label-form__input--name.blur {
  color: #d9d9d9;
}

.label-form__operate {
  flex: 0 0 70px;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.label-form__operate-btn {
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

.label-form__operate-btn.save {
  background-color: #3dbd7d;
}

.label-form__operate-btn.save:active {
  background-color: #39b175;
}

.label-form__operate.save .save {
  margin-left: 0;
}

.label-form__operate.save .cancel {
  margin-left: 100%;
}

.label-form__operate-btn.cancel {
  background-color: #697178;
}

.label-form__operate-btn.cancel:active {
  background-color: #616970;
}

.label-form__operate.cancel .save {
  margin-left: -100%;
}

.label-form__operate.cancel .cancel {
  margin-left: 0;
}

.label-list {
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

.label-list-enter,
.label-list-leave-active {
  transform: translateX(-100%);
}

.label-list-enter-active,
.label-list-leave-active {
  transition: all 0.3s;
}

.no-label {
  font-size: 14px;
  text-align: center;
  color: #919191;
}

.label-category {
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
  text-indent: 5px;
  letter-spacing: 5px;
  color: #919191;
  cursor: pointer;
}

.label-category__slider {
  position: absolute;
  height: 100%;
  border-top: 1px solid #7265e6;
  background-color: rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
}

.label-category__item {
  width: 50%;
  margin: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.label-category__item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.label-category__item.active {
  color: #d9d9d9;
}

.label-category__item:last-child {
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
