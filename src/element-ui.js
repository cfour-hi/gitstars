import Vue from 'vue'
import {
  Tag,
  Input,
  Button,
  Popover,
  Autocomplete,
  Notification,
  RadioGroup,
  RadioButton
} from 'element-ui'

Vue.use(Tag)
Vue.use(Input)
Vue.use(Button)
Vue.use(Popover)
Vue.use(Autocomplete)
Vue.use(RadioGroup)
Vue.use(RadioButton)

Vue.prototype.$notify = Notification
