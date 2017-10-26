<template>
  <div id="app">
    <layout-sidebar></layout-sidebar>
    <layout-header></layout-header>
  </div>
</template>

<script>
import layoutHeader from './components/Header'
import layoutSidebar from './components/Sidebar'

export default {
  name: 'app',
  components: { layoutHeader, layoutSidebar }
}
</script>

