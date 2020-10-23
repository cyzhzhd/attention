<template>
<div>
    <web-rtc-teacher class="webRTC" v-if="$store.state.user.isTeacher"></web-rtc-teacher>
    <web-rtc-student class="webRTC" v-else></web-rtc-student>
    <router-view/>
    div
</div>
</template>

<script>
import { mapActions } from 'vuex';
import bus from '../../utils/bus';
import WebRtcStudent from '../components/Room/webRTCStudent.vue';
import WebRtcTeacher from '../components/Room/webRTCTeacher.vue';

export default {
    name:'Class',  
    components: {
        WebRtcStudent,
        WebRtcTeacher,
    },          
    data() {
        return {
        classroomId: this.$route.params.classroomId,
        classId: this.$route.params.classId,
        };
    },
    methods: {
        enterRoom() {
        this.EnterRoom({
            classroomId: this.classroomId,
            classId: this.classId,
            jwt: this.$store.state.jwt,
            isTeacher: this.$store.state.user.isTeacher,
        });
        },
        ...mapActions('webRTC', ['EnterRoom']),
    },
    mounted() {
        this.$router.push({path: `/class/${this.$route.params.classroomId}/${this.$route.params.classId}`});
        console.log("class mounted");
        this.enterRoom();

        bus.$on('onDeliverDisconnection', () => {
        this.$router.go(-1);
        });

        
        bus.$on('class:start-sharing-screen', () => {
        console.log('이동!');
        this.$router.push({path: `/class/${this.classroomId}/${this.classId}/screenShare`});
        });
    },
    beforeDestroy() {
        bus.$off('onDeliverDisconnection');
        bus.$off('class:start-sharing-screen');
    },
}
</script>

<style>

</style>