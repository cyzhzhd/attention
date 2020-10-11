<template>
  <div>
    <p @click="$router.go(-1)">
      <i class="fa fa-long-arrow-left fa-2x" aria-hidden="true"></i>
    </p>
    {{ roomName }}, {{ roomId }}
  </div>
</template>

<script>
export default {
  name: 'TeamSettings',

  data() {
    return {
      roomId: this.$route.params.roomId,
      roomName: this.$route.params.roomName,
    };
  },
};
</script>

<style></style>
