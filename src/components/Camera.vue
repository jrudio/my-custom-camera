<template>
  <div id="canvas-wrapper">
    <!-- <v-btn>
      Take picture
    </v-btn>
    <v-btn @click="toggleInfo">
      Toggle Info
    </v-btn>
    <v-container v-if="isInfoOpen" grid-list-md text-xs-left>
      <v-layout row wrap>
        <v-flex xs-12>

          <b>commit version: </b> {{ version }}
        </v-flex>
        <v-flex xs-12>
          <b>camera resolution: </b> {{ cameraResolution }}
          <b>screen resolution: </b> {{ screenResolution }}
          <b>device orientation: </b> {{ deviceOrientation }}
          <a href="https://github.com/jrudio/my-custom-camera" target="_blank">Source</a>

        </v-flex>
      </v-layout>

    </v-container> -->

    <!-- <div class="md-layout md-gutter"> -->
      <!-- <div id="log" v-if="hasError">{{ errorMessage }}</div> -->
      <!-- <div class="md-layout-item"> -->
        <canvas id="canvas"></canvas>
      <!-- </div>
    </div> -->
  </div>
</template>

<script>

import BannerOverlay from '../assets/sierra_overlay_2.png';

// when requesting our desired resolution of 640x480 using Chrome's camera api
// we actually get 480x640 on mobile (portrait mode; tested on a Pixel 2)
// landscape gives us our desired constraint
const camera = {
  width: 1920,
  height: 1080,
};

function loadCamera() {
  const { mediaDevices } = navigator;

  if (!mediaDevices) {
    throw new Error('no cameras available');
  }

  return mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { min: 640 },
      height: { min: 480 },
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

function paintCanvas(appState) {
  return function animate() {
    const {
      canvasContainer,
      videoContainer,
    } = appState;

    const { video } = videoContainer;
    const {
      ctx,
      bannerOverlay,
    } = canvasContainer;

    if (videoContainer !== undefined && videoContainer.isReady) {
      ctx.drawImage(video, 50, 0, 200, 150);
    }

    ctx.globalAlpha = 0.55;
    // ctx.drawImage(bannerOverlay, 50, 0);
    ctx.drawImage(bannerOverlay, 50, 0, 200, 150);
    ctx.globalAlpha = 1;

    requestAnimationFrame(paintCanvas(appState));
  };
}

function paintInformation(vueInstance, appState) {
  return function animate() {
    const {
      canvasContainer,
      videoContainer,
    } = appState;

    const { ctx } = canvasContainer;

    if (!vueInstance.isInfoOpen) {
      return;
    }

    const { video } = videoContainer;
    const { videoWidth, videoHeight } = video;
    const { screen } = window;
    const { availHeight, availWidth } = screen;

    let orientation = '';

    if (window.screen.orientation) {
      orientation = window.screen.orientation.type;
    } else if (window.screen.msOrientation) {
      orientation = window.screen.msOrientation;
    }

    ctx.font = '14px serif';
    ctx.textAlign = 'start';

    let info = `camera resolution: ${videoWidth}x${videoHeight}`;
    let infoTextSize = ctx.measureText(info);
    ctx.strokeText(info, 0, 140);
    info = `screen resolution: ${availWidth}x${availHeight}`;
    ctx.strokeText(info, infoTextSize.width, 140);
    infoTextSize = ctx.measureText(info);
    info = `device orientation: ${orientation}`;
    ctx.strokeText(info, infoTextSize.width, 140);

    requestAnimationFrame(paintInformation(vueInstance, appState));
  };
}

function onCanPlayVideo(vueInstance, appState = {}) {
  return function canPlay() {
    const newAppState = Object.assign({}, appState);

    newAppState.videoContainer.isReady = true;
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
      ctx: loadCanvas(),
      bannerOverlay: loadImage(BannerOverlay),
    },
  };

  appState.videoContainer.video.autoplay = true;
  appState.videoContainer.video.oncanplay = onCanPlayVideo(vueInstance, appState);

  // show device information
  requestAnimationFrame(paintInformation(vueInstance, appState));


  requestAnimationFrame(paintCanvas(appState));

  // ask for access to camera and create video container for preview
  loadCamera()
    .then((mediaStream) => {
      const [mediaStreamTrack] = mediaStream.getVideoTracks();

      const newAppState = Object.assign({}, appState);

      if (window.ImageCapture) {
        newAppState.videoContainer.imgCapture = new ImageCapture(mediaStreamTrack);
      }

      newAppState.videoContainer.video.srcObject = mediaStream;

      return newAppState;
    })
    .catch((error) => {
      const msg = `load camera failed: ${error}`;
      console.error(msg);
      vueInstance.newError(msg);
    });
}

export default {
  methods: {
  //   toggleInfo() {
  //     this.isInfoOpen = !this.isInfoOpen;
  //   },
    clearError() {
      this.hasError = false;
      this.errorMessage = '';
    },
    newError(msg) {
      this.hasError = true;
      this.errorMessage = msg;
    },
  },
  mounted() {
    main(this);
  },
  data() {
    return {
      //     cameraResolution: '',
      //     screenResolution: '',
      //     deviceOrientation: '',
      //     isInfoOpen: false,
      errorMessage: '',
      hasError: false,
      //     isPortrait: () => window.screen.orientation.type === 'landscape-primary',
      //     version: window.version,
    };
  },
};

</script>

<style scoped>
  #canvas-wrapper {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  canvas {
    border: 2px black solid;
    width: 100%;
    height: 100%;
  }
</style>
