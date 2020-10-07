<template>
  <div>
    <button @click="stopSharing">stop sharing</button>
  </div>
</template>

<script>
import { ipcRenderer, remote } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

export default {
  methods: {
    stopSharing() {
      ipcRenderer.send('close-sharing-panel');
      const window = remote.getCurrentWindow();
      window.destroy();
    },
  },
};
</script>

<style></style>
