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
    attendPer: false,
    sleepPer: false,
  },
  datacollection: null,
  timeRange: [],
  data: {},
  hasCalculated: {},
};

const getters = {
  studentList(state) {
    return state.studentList;
  },
  displayingUserList(state) {
    return state.displayingUserList;
  },
  datacollection(state) {
    return state.datacollection;
  },
};

const mutations = {
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
  calculateCCTData(state) {
    console.log('calculateCCTData start --------------');
    state.displayingUserList.forEach(userInfo => {
      const { user } = userInfo;
      if (!state.hasCalculated[user]) {
        const student = state.studentList[user];
        console.log('calculating -------------------', student);
        divideDataPerMinute(student);

        state.data[student.user] = {
          focusPoint: [],
          attendPer: [],
          sleepPer: [],
        };
        student.cctTime.forEach(cctTime => {
          const cctArrLength = cctTime.concentrationArr.length || 1;
          let attendPerTTL = 0;
          let focusPointTTL = 0;
          let sleepPerTTL = 0;
          cctTime.concentrationArr.forEach(cctArr => {
            attendPerTTL += cctArr.attendPer;
            focusPointTTL += cctArr.focusPoint;
            sleepPerTTL += cctArr.sleepPer;
          });
          const focusPointMean = focusPointTTL / cctArrLength;
          const attendPerMean = attendPerTTL / cctArrLength;
          const sleepPerMean = sleepPerTTL / cctArrLength;
          cctTime.concentrationMean = {
            attendPer: attendPerMean,
            focusPoint: focusPointMean,
            sleepPer: sleepPerMean,
          };
          state.data[student.user].focusPoint.push(focusPointMean);
          state.data[student.user].attendPer.push(attendPerMean);
          state.data[student.user].sleepPer.push(sleepPerMean);
        });
        state.hasCalculated[user] = true;
      }
    });
    console.log('calculateCCTData end --------------');
  },
  changeDisplayingUserList(state, userInfo) {
    const { name, user } = userInfo;
    const index = state.displayingUserList.findIndex(
      displayingUser => displayingUser.user === user,
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
  createLabels(state) {
    console.log('createLabels start --------------');
    const { startTime, endTime } = getTimeSpan();
    const labels = makeRange(startTime, endTime);
    state.timeRange = labels;
    console.log('createLabels end --------------');
  },
  drawChart(state) {
    console.log('drawChart start --------------');
    state.datacollection = {
      labels: state.timeRange,
      datasets: [],
      options: {
        responsive: false,
        // responsive: true,
        maintainAspectRatio: false,
      },
    };
    state.displayingUserList.forEach(userInfo => {
      const keys = Object.keys(state.CCTType);
      keys.forEach(key => {
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
  drawChartAllClass(state) {
    console.log('drawChartAllClass start --------------');
    state.datacollection = {
      labels: state.timeRange,
      datasets: [],
      options: {
        responsive: false,
        // responsive: true,
        maintainAspectRatio: false,
      },
    };

    const keys = Object.keys(state.CCTType);
    keys.forEach(key => {
      if (state.CCTType[key]) {
        const dataset = {
          label: `${key}`,
          borderColor: chooseColor(key),
          data: state.data[key],
          fill: false,
        };
        state.datacollection.datasets.push(dataset);
      }
    });
    console.log('drawChartAllClass end --------------');
  },
  distributeCCTData(state, concentrations) {
    console.log('distributeCCTData start --------------');
    concentrations.forEach(concentration => {
      state.studentList[concentration.user].cctTotal.push(concentration);
    });
    console.log(state.studentList);
    console.log('distributeCCTData end --------------');
  },
  distributeCCTDataAllClass(state, payload) {
    const { classList, CCTData } = payload;
    state.timeRange = [];
    classList.forEach(classInfo => {
      const startDay = classInfo.startTime.slice(5, 10);
      const classTopic = classInfo.name;
      state.timeRange.push(`${startDay} \n ${classTopic}`);
    });
    state.data = {
      focusPoint: [],
      attendPer: [],
      sleepPer: [],
    };
    CCTData.forEach(cct => {
      state.data.focusPoint.push(cct.avgFocusPoint);
      state.data.attendPer.push(cct.avgAttendPer);
      state.data.sleepPer.push(cct.avgSleepPer);
    });
  },
  fillStudentList(state) {
    console.log('fillStudentList start --------------');
    const keys = Object.keys(state.studentList);
    state.timeRange.forEach(label => {
      keys.forEach(key => {
        state.studentList[key].cctTime.push({
          time: label,
          concentrationArr: [],
          concentrationMean: {},
        });
      });
    });
    console.log('fillStudentList end --------------');
  },
  resetData(state) {
    console.log('-------- reset data start--------');
    const keys = Object.keys(state.studentList);
    if (keys) {
      keys.forEach(key => {
        state.studentList[key].cctTotal = [];
        state.studentList[key].cctTime = [];
      });
    }
    state.data = {};
    state.hasCalculated = {};
    console.log('-------- reset data end--------');
  },
  setStudentList(state, studentList) {
    state.studentList = {};
    console.log(state.studentList);
    console.log(studentList);
    studentList.forEach(student => {
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
};

const actions = {
  CreateLabels({ commit }) {
    commit('createLabels');
  },
  ChangeDisplayingUserList({ commit }, userInfo) {
    commit('changeDisplayingUserList', userInfo);
  },
  ChangeCCTType({ commit }, dataType) {
    commit('changeCCTType', dataType);
  },
  DistributeCCTData({ commit }, concentrations) {
    commit('resetData');
    commit('distributeCCTData', concentrations);
  },
  DisplayData({ commit }, selectedType) {
    if (selectedType === '전체') {
      commit('drawChartAllClass');
    } else {
      commit('calculateCCTData');
      commit('drawChart');
    }
  },
  DrawChartAllClass({ commit }, payload) {
    commit('distributeCCTDataAllClass', payload);
    commit('drawChartAllClass');
  },
  FillStudentList({ commit }) {
    commit('fillStudentList');
  },
  SetStudentList({ commit }, options) {
    console.log(options);
    return fetchUserList(options.jwt, options.params)
      .then(({ data }) => commit('setStudentList', data))
      .catch(error => console.error(error));
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
  keys.forEach(key => {
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
  student.cctTotal.forEach(cctTotal => {
    const date = new Date(cctTotal.date);
    date.setSeconds(0, 0);
    const time = date.toString().split(' ')[4];
    student.cctTime.forEach(cctTime => {
      if (cctTime.time === time) {
        cctTime.concentrationArr.push(cctTotal.status);
      }
    });
  });
}

function chooseColor(key) {
  if (key === 'attendPer') return 'rgba(255, 255, 0, 1)';
  if (key === 'focusPoint') return 'rgba(255, 0, 0, 1)';
  if (key === 'sleepPer') return 'rgba(0, 255, 0, 1)';
  return 'rgba(0, 0, 255, 1)';
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
