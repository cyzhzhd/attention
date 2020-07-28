<template>
  <div>
    Video will be shown here
    <video id="video" width="720" height="560" autoplay muted></video>
  </div>
</template>

<script>
export default {
  mounted() {
    const faceScript = document.createElement('script');
    faceScript.setAttribute('src', '../../../../face-recognition/dist/main.js');
    faceScript.async = true;
    document.head.appendChild(faceScript);
  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  position: absolute;
}
</style>
