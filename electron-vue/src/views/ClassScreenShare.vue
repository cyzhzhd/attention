<template>
  <div>
      asdasda
    <button @click="$router.go(-1)">stop sharing</button>
    <div class="connectedVideos" ref="videos">
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import { ipcRenderer, remote } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

export default {
  computed: {
    ...mapGetters('webRTC', ['storedDisplayingStudentList']),
  },
  methods: {
    // stopSharing() {
    //   ipcRenderer.send('close-sharing-panel');
    //   const window = remote.getCurrentWindow();
    //   window.destroy();
    // },
  },
//   mounted() {    
//     console.log(this.$refs.videos);
//     console.log(this.storedDisplayingStudentList);
//     console.log(this.$store);
//     this.storedDisplayingStudentList.forEach(student => {
//       const video = document.createElement('video');
//       video.style.width = '100%';
//       video.srcObject = student.yourStreams;
//       video.autoplay = true;
//       video.playsinline = true;
//       this.$refs.videos.appendChild(video);

//       const p = document.createElement('p');
//       const textNode = document.createTextNode('added');
//       p.appendChild(textNode);
//       this.$refs.videos.appendChild(p);
//     })
//   }
};
</script>

<style></style>
