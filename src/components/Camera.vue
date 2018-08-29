<template>
  <div id="canvas-wrapper">
    <canvas id="canvas" width="640" height="480"></canvas>
  </div>
</template>

<script>

import TopBanner from '../assets/top_banner.png';
import BottomBanner from '../assets/bottom_banner.png';

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
      topBanner,
      bottomBanner,
    } = canvasContainer;

    // do work
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (videoContainer !== undefined && videoContainer.isReady) {
      const { video, scale } = videoContainer;
      const { videoWidth, videoHeight } = video;

      let top = canvasHeight / 2;

      top -= (videoHeight / 2);
      top *= scale;

      let left = canvasWidth / 2;
      left -= (videoWidth / 2);
      left *= scale;

      ctx.drawImage(video, left, top, videoWidth * scale, videoHeight * scale);
      ctx.globalAlpha = 0.65;
      ctx.drawImage(topBanner, 0, 0);
      ctx.drawImage(bottomBanner, 0, 320);
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(pipeCameraToCanvas(appState));
  };
}

function onCanPlayVideo(appState = {}) {
  return function canPlay() {
    const {
      canvasContainer,
    } = appState;

    const { canvas } = canvasContainer;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const newAppState = Object.assign({}, appState);

    newAppState.videoContainer.scale =
       Math.min(canvasWidth / this.videoWidth, canvasHeight / this.videoHeight);
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
      scale: 0,
    },
    canvasContainer: {
      wrapper: document.getElementById('canvas-wrapper'),
      canvas: document.getElementById('canvas'),
      ctx: loadCanvas(),
      topBanner: loadImage(TopBanner),
      bottomBanner: loadImage(BottomBanner),
      // isReady: false,
    },
  };

  appState.videoContainer.video.autoplay = true;

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
      hello: 'world',
    };
  },
};

</script>

<style scoped>
  canvas {
    border: 10px white solid;
  }
</style>
