<template>
  <div id="app">
    <NavBar />
    <RouterView />
    <FooterView />
  </div>
</template>

<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterView from './views/FooterView.vue'

export default {
  name: 'App',
  components: {
    RouterView,
    NavBar,
    FooterView
  }
}
</script>

<style>
#app {
  min-height: 100vh;
}

/* regles globales pour eviter le contenu cache sous la navbar fixe */
body {
  margin: 0;
  padding: 0;
}

html, body, #app {
  overflow-x: hidden;
}

*, *::before, *::after {
  box-sizing: border-box;
}

img, svg, video, iframe {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
