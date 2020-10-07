<template>
  <div>
    <button @click="stopSharing">stop sharing</button>
  </div>
</template>

<script>
import { ipcRenderer, remote } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import bus from '../../utils/bus';

export default {
  methods: {
    stopSharing() {
      ipcRenderer.send('close-sharing-panel');
      bus.$emit('stopSharing');
      const window = remote.getCurrentWindow();
      window.destroy();
    },
  },
};
</script>

<style></style>
