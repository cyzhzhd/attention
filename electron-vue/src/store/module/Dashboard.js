/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: "error" */
import { fetchUserList } from '../../api';

const state = {
  classId: '',
  studentList: {},
  displayingUserList: [],
  CCTType: {
    focusPoint: true,
    absence: false,
    sleep: false,
    turnHead: false,
  },
  datacollection: null,
  timeRange: [],
  data: {},
  hasCalculated: {},
};

const getters = {
  classId(state) {
    return state.classId;
  },
  studentList(state) {
    return state.studentList;
  },
  displayingUserList(state) {
    return state.displayingUserList;
  },
  CCTType(state) {
    return state.CCTType;
  },
  datacollection(state) {
    return state.datacollection;
  },
};

const mutations = {
  changeClassId(state, classId) {
    state.classId = classId;
  },
  setStudentList(state, studentList) {
    state.studentList = {};
    console.log(state.studentList);
    console.log(studentList);
    studentList.forEach((student) => {
      const { _id, name, email } = student;
      const id = _id;
      state.studentList[id] = {
        user: id,
        name,
        email,
        cctTotal: [],
        cctTime: [],
      };
    });
  },
  changeDisplayingUserList(state, userInfo) {
    const { name, user } = userInfo;
    const index = state.displayingUserList.findIndex(
      (displayingUser) => displayingUser.user === user,
    );

    if (index === -1) {
      state.displayingUserList.push({ user, name });
    } else {
      state.displayingUserList.splice(index, 1);
    }
  },
  changeCCTType(state, dataType) {
    state.CCTType[dataType] = !state.CCTType[dataType];
  },
  fillStudentList(state) {
    const keys = Object.keys(state.studentList);
    state.timeRange.forEach((label) => {
      keys.forEach((key) => {
        state.studentList[key].cctTime.push({
          time: label,
          concentrationArr: [],
          concentrationMean: {},
        });
      });
    });
  },
  getLabels(state) {
    const { startTime, endTime } = getTimeSpan();
    const labels = makeRange(startTime, endTime);
    state.timeRange = labels;
  },

  resetData(state) {
    const keys = Object.keys(state.studentList);
    if (keys) {
      keys.forEach((key) => {
        state.studentList[key].cctTotal = [];
        state.studentList[key].cctTime = [];
      });
    }
    state.data = {};
    state.hasCalculated = {};
  },
  distributeCCTData(state, concentrations) {
    concentrations.forEach((concentration) => {
      state.studentList[concentration.user].cctTotal.push(concentration);
    });
    console.log(state.studentList);
  },

  calculateCCTData(state) {
    console.log('calculateCCTData start --------------');
    state.displayingUserList.forEach((userInfo) => {
      const { user } = userInfo;
      if (!state.hasCalculated[user]) {
        const student = state.studentList[user];
        console.log('calculating -------------------', student);
        divideDataPerMinute(student);

        state.data[student.user] = {
          focusPoint: [],
          absence: [],
          sleep: [],
          turnHead: [],
        };
        student.cctTime.forEach((cctTime) => {
          const cctArrLength = cctTime.concentrationArr.length || 1;
          let absenceTTL = 0;
          let focusPointTTL = 0;
          let sleepTTL = 0;
          let turnHeadTTL = 0;
          cctTime.concentrationArr.forEach((cctArr) => {
            absenceTTL += cctArr.absence;
            focusPointTTL += cctArr.focusPoint;
            sleepTTL += cctArr.sleep;
            turnHeadTTL += cctArr.turnHead;
          });
          const focusPointMean = focusPointTTL / cctArrLength;
          const absenceMean = (absenceTTL / cctArrLength) * 100;
          const sleepMean = (sleepTTL / cctArrLength) * 100;
          const turnHeadMean = (turnHeadTTL / cctArrLength) * 100;
          cctTime.concentrationMean = {
            absence: absenceMean,
            focusPoint: focusPointMean,
            sleep: sleepMean,
            turnHead: turnHeadMean,
          };
          state.data[student.user].focusPoint.push(focusPointMean);
          state.data[student.user].absence.push(absenceMean);
          state.data[student.user].sleep.push(sleepMean);
          state.data[student.user].turnHead.push(turnHeadMean);
        });
        state.hasCalculated[user] = true;
      }
    });
    console.log('calculateCCTData end --------------');
  },

  addDataSet(userInfo, key) {
    const { user, name } = userInfo;
    console.log(key);
    console.log(state.data[user]);
    return {
      label: `${name} - ${key}`,
      borderColor: chooseColor(key),
      data: state.data[user][key],
      fill: false,
    };
  },

  drawChart(state) {
    console.log('drawChart start --------------');
    state.datacollection = {
      labels: state.timeRange,
      datasets: [],
      options: {
        // responsive: false,
        responsive: true,
        maintainAspectRatio: false,
      },
    };
    state.displayingUserList.forEach((userInfo) => {
      const keys = Object.keys(state.CCTType);
      keys.forEach((key) => {
        if (state.CCTType[key]) {
          const { user, name } = userInfo;
          const dataset = {
            label: `${name} - ${key}`,
            borderColor: chooseColor(key),
            data: state.data[user][key],
            fill: false,
          };
          state.datacollection.datasets.push(dataset);
        }
      });
    });
    console.log('drawChart end --------------');
  },
};

const actions = {
  ChangeClassId({ commit }, classId) {
    commit('changeClassId', classId);
  },
  SetStudentList({ commit }, options) {
    console.log(options);
    return fetchUserList(options.jwt, options.params)
      .then(({ data }) => commit('setStudentList', data))
      .catch((error) => console.error(error));
  },
  ChangeDisplayingUserList({ commit }, userInfo) {
    commit('changeDisplayingUserList', userInfo);
  },
  ChangeCCTType({ commit }, dataType) {
    commit('changeCCTType', dataType);
  },
  async DistributeCCTData({ commit }, concentrations) {
    console.log('distributeCCTData start --------------');
    commit('resetData');
    commit('distributeCCTData', concentrations);
    console.log('distributeCCTData end --------------');
  },

  FillStudentList({ commit }) {
    console.log('fillStudentList start --------------');
    commit('fillStudentList');
    console.log('fillStudentList end --------------');
  },

  GetLabels({ commit }) {
    console.log('getLabels start --------------');
    commit('getLabels');
    console.log('getLabels end --------------');
  },

  DisplayData({ commit }) {
    commit('calculateCCTData');
    commit('drawChart');
  },
};

function compare(a, b) {
  return a.valueOf() && b.valueOf() ? (a > b) - (a < b) : NaN;
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
function makeRange(sTime, eTime) {
  const labels = [];
  let time = sTime;
  while (compare(time, eTime) < 1) {
    const splits = time.toString().split(' ');
    labels.push(splits[4]);
    time = addMinutes(time, 1);
  }
  return labels;
}

function getTimeSpan() {
  let startTime = new Date('2050-10-09T06:18:33.674Z');
  let endTime = new Date('2010-10-09T06:18:33.674Z');
  const keys = Object.keys(state.studentList);
  keys.forEach((key) => {
    const { cctTotal } = state.studentList[key];
    const length = cctTotal.length - 1;
    if (cctTotal[0]) {
      const firstData = new Date(cctTotal[0].date);
      const lastData = new Date(cctTotal[length].date);
      startTime = compare(startTime, firstData) === -1 ? startTime : firstData;
      endTime = compare(endTime, lastData) === 1 ? endTime : lastData;
    }
  });
  startTime.setSeconds(0, 0);
  endTime.setSeconds(0, 0);
  return { startTime, endTime };
}

function divideDataPerMinute(student) {
  student.cctTotal.forEach((cctTotal) => {
    const date = new Date(cctTotal.date);
    date.setSeconds(0, 0);
    const time = date.toString().split(' ')[4];
    student.cctTime.forEach((cctTime) => {
      if (cctTime.time === time) {
        cctTime.concentrationArr.push(cctTotal.status);
      }
    });
  });
}

function chooseColor(key) {
  if (key === 'absence') return 'rgba(255, 255, 0, 1)';
  if (key === 'focusPoint') return 'rgba(255, 0, 0, 1)';
  if (key === 'sleep') return 'rgba(0, 255, 0, 1)';
  return 'rgba(0, 0, 255, 1)';
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
