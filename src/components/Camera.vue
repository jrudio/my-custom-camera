<template>
  <div id="canvas-wrapper">
    <v-btn @click="toggleInfo">
      Toggle Info
    </v-btn>
    <v-container v-if="isInfoOpen" grid-list-md text-xs-left>
      <v-layout row wrap>
        <v-flex xs-12>

          <b>commit version: </b> {{ version }}
        <!-- </v-flex>
        <v-flex xs-12> -->
          <b>camera resolution: </b> {{ cameraResolution }}
          <b>screen resolution: </b> {{ screenResolution }}
          <b>device orientation: </b> {{ deviceOrientation }}
          <a href="https://github.com/jrudio/my-custom-camera" target="_blank">Source</a>

        </v-flex>
      </v-layout>

    </v-container>

    <div class="md-layout md-gutter">
      <div class="md-layout-item">
        <canvas id="canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>

import BannerOverlay from '../assets/sierra_overlay_2.png';

// when requesting our desired resolution of 640x480 using Chrome's camera api
// we actually get 480x640 on mobile (portrait mode; tested on a Pixel 2)
// landscape gives us our desired constraint
const camera = {
  width: 640,
  height: 480,
};

function loadCamera() {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: camera.width,
      height: camera.height,
      facingMode: 'environment',
    },
  });
}

function loadImage(url) {
  const img = new Image();

  img.src = url;

  return img;
}

// loadCanvas gets the canvas element and returns the context
function loadCanvas() {
  const canvas = document.querySelector('canvas');
  let ctx;

  if (canvas) {
    ctx = canvas.getContext('2d');
  } else {
    console.error('canvas did not load');
  }

  return ctx;
}

function pipeCameraToCanvas(vueInstance, appState = {}) {
  return function animate() {
    const {
      canvasContainer,
      videoContainer,
    } = appState;

    const {
      ctx,
      bannerOverlay,
    } = canvasContainer;

    let orientation = '';

    if (window.screen.orientation) {
      orientation = window.screen.orientation.type;
    } else if (window.screen.msOrientation) {
      orientation = window.screen.msOrientation;
    }

    // do work

    if (videoContainer !== undefined && videoContainer.isReady) {
      const { video } = videoContainer;
      const { videoWidth, videoHeight } = video;
      const { screen } = window;
      const { availHeight, availWidth } = screen;

      vueInstance.cameraResolution = `${videoWidth}x${videoHeight}`;
      vueInstance.screenResolution = `${availWidth}x${availHeight}`;
      vueInstance.deviceOrientation = orientation;

      // we need landscape
      // if (screen.orientation.type !== 'landscape-primary') {
      //   requestAnimationFrame(pipeCameraToCanvas(appState));
      //   return;
      // }

      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      // ctx.drawImage(video, 0, 0, availWidth, availHeight);
      ctx.globalAlpha = 0.55;
      ctx.drawImage(bannerOverlay, 0, 0, videoWidth, videoHeight);
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(pipeCameraToCanvas(vueInstance, appState));
  };
}

function onCanPlayVideo(vueInstance, appState = {}) {
  return function canPlay() {
    const newAppState = Object.assign({}, appState);

    newAppState.videoContainer.isReady = true;

    requestAnimationFrame(pipeCameraToCanvas(vueInstance, newAppState));
  };
}

function main(vueInstance) {
  const appState = {
    videoContainer: {
      video: document.createElement('video'),
      ratio: camera.width / camera.height,
      imgCapture: null,
      isReady: false,
    },
    canvasContainer: {
      wrapper: document.getElementById('canvas-wrapper'),
      canvas: document.getElementById('canvas'),
      ctx: loadCanvas(),
      bannerOverlay: loadImage(BannerOverlay),
      // isReady: false,
    },
  };

  appState.videoContainer.video.autoplay = true;
  appState.canvasContainer.canvas.height = camera.height;
  appState.canvasContainer.canvas.width = camera.width;

  // ask for access to camera and create video container for preview
  loadCamera()
    .then((mediaStream) => {
      const [mediaStreamTrack] = mediaStream.getVideoTracks();

      const newAppState = Object.assign({}, appState);

      if (window.ImageCapture) {
        newAppState.videoContainer.imgCapture = new ImageCapture(mediaStreamTrack);
      }

      newAppState.videoContainer.video.srcObject = mediaStream;
      newAppState.videoContainer.video.oncanplay = onCanPlayVideo(vueInstance, appState);

      return newAppState;
    })
    .then((newAppState) => {
      pipeCameraToCanvas(vueInstance, newAppState);

      return newAppState;
    })
    .catch((error) => {
      document.getElementById('log').innerText = `load camera failed: ${error}`;
      console.error(error);
    });
}

export default {
  methods: {
    toggleInfo (e) {
      this.isInfoOpen = !this.isInfoOpen
    }
  },
  mounted() {
    main(this);
  },
  data() {
    return {
      cameraResolution: '',
      screenResolution: '',
      deviceOrientation: '',
      isInfoOpen: false,
      isPortrait: () => window.screen.orientation.type === 'landscape-primary',
      version: window.version,
    };
  },
};

</script>

<style scoped>
  canvas {
    border: 10px white solid;
  }
</style>
