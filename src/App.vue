<template>
  <div id="app">
    <camera-overlay></camera-overlay>
  </div>
</template>

<script>
import Camera from './components/Camera.vue';

export default {
  name: 'app',
  components: {
    CameraOverlay: Camera,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
