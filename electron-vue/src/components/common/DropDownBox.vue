<template>
  <div class="dropdown-box">
    <div class="dropdown-box-label" @click="onClickDropdown(size)">
      <slot name="header"> default header </slot>
      <img
        class="dropdown-icon"
        src="../../assets/img/login-signup/dropdown.png"
      />
    </div>
    <slot name="type"></slot>
  </div>
</template>

<script>
export default {
  props: ['size'],
  methods: {
    onClickDropdown(size) {
      this.$store.dispatch('CHANGE_DROPDOWN_STATUS', size);
    },
  },
};
</script>

<style scoped></style>
