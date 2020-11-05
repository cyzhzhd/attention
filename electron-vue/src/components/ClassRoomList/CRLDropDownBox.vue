<template>
  <div class="contents-tool-box">
    <drop-down-box v-bind:type="type.semester">
      <div slot="header">학기</div>
      <div slot="type">
        <div
          id="semester-dropdown"
          class="dropdown-box-contents dropdown-box-contents-close"
        >
          <div class="dropdown-list-item">2020년도 2학기</div>
          <div class="dropdown-list-item">2020년도 2학기</div>
          <div class="dropdown-list-item">2020년도 2학기</div>
          <div class="dropdown-list-item">2020년도 2학기</div>
        </div>
      </div>
    </drop-down-box>

    <drop-down-box
      v-bind:type="type.createClassroom"
      v-if="$store.state.user.isTeacher"
    >
      <div slot="header">교실 생성하기</div>
      <div slot="type">
        <div
          id="create-classroom-dropdown"
          class="dropdown-box-contents dropdown-box-contents-close"
        >
          <div class="create-classroom-form">
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">이름</div>
              <input
                type="text"
                class="create-classroom-input"
                v-model.trim="roomName"
              />
            </div>
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">
                과목
                <select name="dropdown" v-model="tags">
                  <option value="국어" selected>국어</option>
                  <option value="영어">영어</option>
                  <option value="수학">수학</option>
                  <option value="사회">사회</option>
                  <option value="과학">과학</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">
                수업유형
                <select name="dropdown2" v-model="classType">
                  <option value="public" selected>public</option>
                  <option value="private">private</option>
                </select>
              </div>
            </div>

            <p class="error-message">{{ errorMessage }}</p>
            <div class="create-classroom-button" @click="createClassRoom()">
              만들기
            </div>
          </div>
        </div>
      </div>
    </drop-down-box>
    <drop-down-box v-bind:type="type.addClassroom" v-else>
      <div slot="header">교실 추가하기</div>
      <div slot="type">
        <div
          id="create-classroom-dropdown"
          class="dropdown-box-contents dropdown-box-contents-close"
        >
          <div class="create-classroom-form">
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">교실코드</div>
              <input
                type="text"
                class="create-classroom-input"
                v-model.trim="roomCode"
              />
            </div>

            <p class="error-message">{{ errorMessage }}</p>
            <div class="create-classroom-button" @click="addClassRoom()">
              추가하기
            </div>
          </div>
        </div>
      </div>
    </drop-down-box>
  </div>
</template>

<script>
import bus from '../../../utils/bus';
import DropDownBox from '../common/DropDownBox.vue';

export default {
  components: {
    DropDownBox,
  },
  data() {
    return {
      type: {
        semester: 'semester',
        createClassroom: 'createClassroom',
        addClassroom: 'addClassroom',
      },
      tags: '국어',
      roomName: '',
      classType: 'public',
      roomCode: '',
      errorMessage: '',
    };
  },
  methods: {
    async createClassRoom() {
      const options = {
        name: this.roomName,
        tags: this.tags,
        classType: this.classType,
      };
      const isSuccess = await this.$store.dispatch('CREATE_CLASSROOM', options);
      if (isSuccess) {
        this.roomName = '';
        this.tags = '국어';
        this.classType = 'public';
        bus.$emit('dropDownBox:onClickDropDown', 'createClassroom');
        bus.$emit('ClassRoomList:addClassRoom');
      } else {
        this.errorMessage = '교실 이름을 다시 확인해주세요.';
      }
    },

    async addClassRoom() {
      const options = {
        class: this.roomCode,
      };
      const isSuccess = await this.$store.dispatch('ADD_CLASSROOM', options);
      if (isSuccess) {
        this.roomCode = '';
        bus.$emit('dropDownBox:onClickDropDown', 'addClassroom');
        bus.$emit('ClassRoomList:addClassRoom');
      } else {
        this.errorMessage = '코드를 다시 확인해주세요.';
      }
    },
  },
};
</script>

<style>
.contents-tool-box {
  width: 900px;
  height: 50px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
}

.dropdown-box {
  width: 300px;
  height: 52px;
  border: 1px solid #9097fd;
  background-color: #fff;
  padding: 0 16px;
  cursor: pointer;
  position: relative;
}

.dropdown-box-label {
  width: 100%;
  height: 100%;
  color: #9097fd;
  font-weight: 400;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-box-contents {
  position: absolute;
  padding: 0 16px;
  left: -1;
  right: -1;
  top: 51px;
  overflow: hidden;
  transition: height 300ms ease-in;
  background-color: #fff;
  z-index: 1000;
  border-right: 1px solid #9097fd;
  border-left: 1px solid #9097fd;
  border-bottom: 1px solid #9097fd;
}

.dropdown-box-contents-close {
  height: 0;
  visibility: hidden;
}

.dropdown-box-contents-open {
  height: auto;
  visibility: visible;
  width: 300px;
  left: -1px;
}

.dropdown-list-item {
  width: 100%;
  height: 52px;
  color: #9097fd;
  font-weight: 400;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.error-message {
  color: red;
}
</style>
