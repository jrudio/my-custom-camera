<template>
  <div id="canvas-wrapper">

    <!-- <h4>My Custom Camera App by Justin Rudio</h4>

    <md-button class="md-raised">
      show stats
    </md-button> -->
    <h1 v-if="isPortrait">Please put your phone in landscape mode!</h1>

    <p id="log"></p>

    <div class="md-layout md-gutter">
      <div class="md-layout-item">
        <canvas id="canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>

import BannerOverlay from '../assets/sierra_overlay.png';

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

function pipeCameraToCanvas(appState = {}) {
  return function animate() {
    const {
      canvasContainer,
      videoContainer,
    } = appState;

    const {
      canvas,
      ctx,
      bannerOverlay,
    } = canvasContainer;

    // do work
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (videoContainer !== undefined && videoContainer.isReady) {
      const { video } = videoContainer;
      const { videoWidth, videoHeight } = video;
      // const { screen } = window;
      // const { availHeight, availWidth } = screen;

      let info = `video - width: ${videoWidth} height: ${videoHeight}\n`;
      // info += `canvas - width: ${canvasWidth} height: ${canvasHeight}\n`;
      // info += `viewport - width: ${availWidth} height: ${availHeight}`;
      info += window.screen.orientation.type;
      document.getElementById('log').innerText = info;

      // we need landscape
      // if (screen.orientation.type !== 'landscape-primary') {
      //   requestAnimationFrame(pipeCameraToCanvas(appState));
      //   return;
      // }

      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      ctx.globalAlpha = 0.55;
      ctx.drawImage(bannerOverlay, 0, 0, videoWidth, videoHeight);
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(pipeCameraToCanvas(appState));
  };
}

function onCanPlayVideo(appState = {}) {
  return function canPlay() {
    const newAppState = Object.assign({}, appState);

    newAppState.videoContainer.isReady = true;

    requestAnimationFrame(pipeCameraToCanvas(newAppState));
  };
}

function main() {
  const appState = {
    videoContainer: {
      video: document.createElement('video'),
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

      newAppState.videoContainer.imgCapture = new ImageCapture(mediaStreamTrack);
      newAppState.videoContainer.video.srcObject = mediaStream;
      newAppState.videoContainer.video.oncanplay = onCanPlayVideo(appState);

      return newAppState;
    })
    .then((newAppState) => {
      pipeCameraToCanvas(newAppState);

      return newAppState;
    })
    .catch((error) => {
      console.error(error);
    });
}

export default {
  mounted() {
    main();
  },
  data() {
    return {
      isPortrait: () => window.screen.orientation.type === 'landscape-primary',
    };
  },
};

</script>

<style scoped>
  canvas {
    border: 10px white solid;
  }
</style>
