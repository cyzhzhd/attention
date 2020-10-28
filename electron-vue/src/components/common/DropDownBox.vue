<template>
  <div class="dropdown-box">
    <div class="dropdown-box-label" @click="onClickDropdown(type)">
      <slot name="header"> default header </slot>
      <img
        class="dropdown-icon"
        src="../../assets/img/login-signup/dropdown.png"
      />
    </div>
    <slot name="type"> semester </slot>
  </div>
</template>

<script>
import bus from '../../../utils/bus';

export default {
  props: ['type'],
  data() {
    return {
      dropDownStatus: {
        semester: false,
        classroom: false,
        class: false,
      },
    };
  },
  methods: {
    onClickDropdown(name) {
      let element = null;
      if (name === 'semester') {
        element = document.getElementById('semester-dropdown');
      } else if (name === 'classroom') {
        element = document.getElementById('create-classroom-dropdown');
      } else if (name === 'class') {
        element = document.getElementById('week-dropdown');
      }
      console.log(this.dropDownStatus);
      const isOpen = this.dropDownStatus[name];
      console.log(isOpen);
      if (isOpen) {
        element.classList.remove('dropdown-box-contents-open');
        element.classList.add('dropdown-box-contents-close');
        this.dropDownStatus[name] = false;
      } else {
        element.classList.remove('dropdown-box-contents-close');
        element.classList.add('dropdown-box-contents-open');
        this.dropDownStatus[name] = true;
      }
    },
  },
  mounted() {
    console.log('DropDownBox mounted');
    bus.$on('classroomList:created-room', (name) => {
      console.log(name);
      this.onClickDropdown(name);
    });
  },
  beforeDestroy() {
    bus.$off('classroomList:created-room');
  },
};
</script>

<style scoped></style>
