<template>
  <section id="sidebar">
    <header>
      <h1 style="display: none;">Github Stars Manager</h1>
      <a href="https://github.com/Monine/gitstars" target="_blank">
        <img src="../assets/app-name.png" alt="app name" class="app-name-img">
      </a>
    </header>
    <ul class="nav-label">
      <li class="nav-item" @click="handleToggleLabel(0)">
        <label class="nav-item__label">
          <i class="fa fa-fw fa-bars" aria-hidden="true"></i>
          <span>全部</span>
        </label>
        <span class="nav-item-badge">{{starredReposLen}}</span>
      </li>
      <li class="nav-item" @click="handleToggleLabel(-1)">
        <label class="nav-item__label">
          <i class="fa fa-fw fa-star-o" aria-hidden="true"></i>
          <span>未标签</span>
        </label>
        <span class="nav-item-badge">{{unlabeledReposLen}}</span>
      </li>
    </ul>
    <div class="label-nav">
      <header class="nav-caption">
        <h3 class="nav-caption__title">标签</h3>
        <div class="nav-caption__operate-btn" :class="{ disabled: isEditLabel || labelNameFormVisible }" @click="handleAddNewLabel">
          <i class="fa fa-plus-square" aria-hidden="true"></i>
          <span>添加</span>
        </div>
        <div v-show="isEditLabel" class="nav-caption__operate-btn nav-caption__complete-btn" @click="handleCompleteEditLabels">完成</div>
        <div v-show="!isEditLabel" :class="{ disabled: labelNameFormVisible }" class="nav-caption__operate-btn" @click="handleEditLabels">
          <i class="fa fa-cog" aria-hidden="true"></i>
          <span>编辑</span>
        </div>
      </header>
      <transition name="slide-down">
        <form v-show="labelNameFormVisible" class="label-form" onsubmit="return false">
          <input v-model="labelName" ref="labelFormNameInput" type="text" class="label-form__input--name" placeholder="标签名称" @input="handleInputLabelName" @focus="handleInputLabelName" @blur="handleInputLabelName" @keyup.enter.prevent="handleAddLabel" @keyup.esc="handleCancelAddLabel">
          <div class="label-form__operate" :class="saveOrCancel" @mouseleave="saveOrCancel = ''">
            <button type="button" class="label-form__operate-btn save" @mouseenter="saveOrCancel = 'save'" @click="handleAddLabel">SAVE</button>
            <button type="button" class="label-form__operate-btn cancel" @mouseenter="saveOrCancel = 'cancel'" @click="handleCancelAddLabel">CANCEL</button>
          </div>
        </form>
      </transition>
      <div v-show="isEditLabel" class="edit-label-tip">双击标签修改名称，拖拽标签排列顺序</div>
      <draggable :list="dragLabels" :options="dragOptions">
        <transition-group name="label-list" tag="ul" class="nav-label label-list">
          <li v-for="(label, index) of dragLabels" :key="label.id" class="nav-item" @click="handleToggleLabel(label.id)">
            <label class="nav-item__label slo" @dblclick="handleEditLabelName(label)">
              <i class="fa fa-fw fa-tag" aria-hidden="true"></i>
              <span v-show="!label._isEdit" class="nav-item__name slo">{{label.name}}</span>
              <input v-show="label._isEdit" :ref="label._ref" type="text" :value="label.name" class="nav-item__input--name" @blur="handleChangeLabelNameByBlur(label)" @keyup.enter="handleChangeLabelNameByEnter(label)" @keyup.esc="handleCancelEditLabelName(label)">
            </label>
            <el-popover placement="right" title="Are you sure?">
              <i v-show="isEditLabel" slot="reference" class="fa fa-times-circle" aria-hidden="true" @click.stop="handleDeleteLabel"></i>
              <footer class="popover-footer">
                <el-button size="mini" @click="handleCancelDeleteLabel">No</el-button>
                <el-button type="primary" size="mini" @click="handleConfirmDeleteLabel(label.id, index)">Yes</el-button>
              </footer>
            </el-popover>
            <span v-show="!isEditLabel" class="nav-item-badge">{{label.repos.length}}</span>
          </li>
        </transition-group>
      </draggable>
      <div v-show="!labels.length" class="no-label vc-p">
        <i class="fa fa-hand-o-up fa-2x" aria-hidden="true"></i>
        <p>添加标签</p>
      </div>
    </div>
    <footer class="sidebar-footer">
      <span>Author&nbsp;:&nbsp;</span>
      <h1 class="author"><a href="https://github.com/Monine" target="_blank">Monine</a></h1>
    </footer>
  </section>
</template>

<script>
import draggable from 'vuedraggable'

import constants from '../constants'

const { LABEL_NAME_CANNOT_ENPTY, LABEL_NAME_ALREADY_EXIST } = constants
const classSave = 'save'
const classCancel = 'cancel'
let dragLabelsClone = []

export default {
  name: 'sidebar',
  components: { draggable },
  props: {
    starredReposLen: { type: Number, default: 0 },
    unlabeledReposLen: { type: Number, default: 0 },
    labels: { type: Array, default: [] }
  },
  data () {
    return {
      labelNameFormVisible: false,
      labelName: '',
      saveOrCancel: '',
      isEditLabel: false,
      dragLabels: tranformLabels(this.labels)
    }
  },
  computed: {
    dragOptions () {
      return {
        disabled: !this.isEditLabel
      }
    }
  },
  watch: {
    labels: {
      deep: true,
      handler (newVal) {
        this.dragLabels = tranformLabels(newVal)
      }
    }
  },
  destroyed () {
    dragLabelsClone = []
  },
  methods: {
    handleToggleLabel (id) {
      if (this.isEditLabel) return
      this.$emit('toggleLabel', id)
    },
    handleAddNewLabel () {
      if (this.isEditLabel || this.labelNameFormVisible) return

      this.labelNameFormVisible = true
      this.$nextTick(() => this.$refs.labelFormNameInput.focus())
    },
    handleInputLabelName () {
      this.saveOrCancel = this.labelName.trim().length ? classSave : classCancel
    },
    handleAddLabel () {
      let message = ''
      const labelName = this.labelName.trim()
      if (!labelName) message = LABEL_NAME_CANNOT_ENPTY
      if (this.labels.find(({ name }) => name === labelName)) message = LABEL_NAME_ALREADY_EXIST
      if (message) {
        this.$notify.warning({ message, showClose: false, position: 'bottom-right' })
        return this.$refs.labelFormNameInput.focus()
      }

      this.$emit('saveNewLabel', labelName)
      this.labelNameFormVisible = false
      this.labelName = ''
    },
    handleCancelAddLabel () {
      this.labelNameFormVisible = false
      this.labelName = ''
    },
    handleEditLabels () {
      if (this.labelNameFormVisible) return

      this.isEditLabel = true
      dragLabelsClone = JSON.parse(JSON.stringify(this.dragLabels))
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
      if (!newLabelName) {
        label.name = label._preName
        label._isEdit = false
        return
      }

      if (this.dragLabels.find(dragLabel => (dragLabel.name === newLabelName && dragLabel !== label))) {
        this.$notify.warning({ message: LABEL_NAME_ALREADY_EXIST, showClose: false, position: 'bottom-right' })
        return $input.focus()
      }

      label.name = newLabelName
      label._preName = ''
      label._isEdit = false
    },
    handleChangeLabelNameByEnter (label) {
      let message = ''
      const $input = this.$refs[label._ref][0]
      const newLabelName = $input.value.trim()
      if (!newLabelName) message = LABEL_NAME_CANNOT_ENPTY
      if (this.dragLabels.find(dragLabel => (dragLabel.name === newLabelName && dragLabel !== label))) message = LABEL_NAME_ALREADY_EXIST

      if (message) {
        this.$notify.warning({ message, showClose: false, position: 'bottom-right' })
        return $input.focus()
      }

      label.name = newLabelName
      label._preName = ''
      label._isEdit = false
    },
    handleCancelEditLabelName (label) {
      label.name = label._preName
      label._preName = ''
      label._isEdit = false
    },
    handleDeleteLabel () {
      document.body.click()
    },
    handleConfirmDeleteLabel (labelId, index) {
      this.dragLabels.splice(index, 1)
      this.$emit('deleteLabel', labelId)
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
      const labels = this.dragLabels.map(({ id, name, repos }) => ({ id, name, repos }))
      if (isChanged) this.$emit('completeEditLabels', labels)
    }
  }
}

function tranformLabels (labels = {}) {
  const dragLabels = JSON.parse(JSON.stringify(labels))
  dragLabels.forEach((label, index) => {
    label._isEdit = false
    label._ref = `labelNameEditInput${label.id}`
    label._preName = ''
  })
  return dragLabels
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
  cursor: pointer;
}

.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: none;
  height: 40px;
  padding: 0 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-caption__operate-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item:active,
.nav-caption__operate-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
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
  cursor: pointer;
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
  font-size: 12px;
  text-align: center;
  padding: 5px;
  color: #919191;
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
}

.nav-caption__title {
  flex: auto;
  text-indent: 15px;
  font-size: 14px;
  color: #919191;
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

.slide-down-enter,
.slide-down-leave-active {
  height: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: height 0.2s ease-out;
}

.label-form__input--name {
  flex: auto;
  box-sizing: border-box;
  padding: 0 15px;
  border: none;
  line-height: 1.5;
  outline: none;
  background-color: rgba(255, 255, 255, 0.1);
}

.label-form__input--name:focus {
  color: #28343d;
  background-color: #fff;
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
  text-align: center;
  color: #fff;
  cursor: pointer;
  outline: none;
  transition: margin-left 0.3s ease-out 0.1s,
    background-color 0.3s ease-out 0.1s;
}

.label-form__operate-btn.save {
  margin-left: -50%;
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
  margin-left: 50%;
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
  transition: transform 0.1s;
}

.fa-times-circle:hover {
  transform: scale(1.5);
}

.label-list-enter,
.label-list-level-active {
  transform: translateX(-100%);
}

.label-list-enter-active,
.label-list-level-active {
  transition: transform 0.3s;
}

.no-label {
  font-size: 14px;
  text-align: center;
  color: #919191;
}

.sidebar-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 30px;
  border-top: 1px solid #7265e6;
  font-size: 14px;
  text-align: center;
  color: #7265e6;
}

.author {
  font-size: inherit;
}
</style>

<style>
#sidebar .sidebar-footer a {
  color: #7265e6;
}

#appName a {
  color: #fff;
}

#appName a:hover {
  text-decoration: none;
}
</style>
