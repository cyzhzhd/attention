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
  interval: 5,
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
  interval(state) {
    return state.interval;
  },
};

const mutations = {
  calculateAverageCCTData(state) {
    console.log('calculateAverageCCTData start --------------');
    state.displayingUserList.forEach((userInfo) => {
      const { user } = userInfo;
      if (!state.hasCalculated[user]) {
        const student = state.studentList[user];
        console.log('calculating -------------------', student);
        divideDataPerInterval(student);

        state.data[student.user] = {
          focusPoint: [],
          attendPer: [],
          sleepPer: [],
        };
        student.cctTime.forEach((cctTime) => {
          const cctArrLength = cctTime.concentrationArr.length || 1;

          // reduce?
          let attendPerTTL = 0;
          let focusPointTTL = 0;
          let sleepPerTTL = 0;
          cctTime.concentrationArr.forEach((cctArr) => {
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
    console.log('calculateAverageCCTData end --------------');
  },
  changeDisplayingUserList(state, { name, user }) {
    const index = state.displayingUserList.findIndex(
      (displayingUser) => displayingUser.user === user,
    );

    if (index === -1) {
      state.displayingUserList.push({ user, name });
      document.getElementById(user).classList.add('user-selected');
    } else {
      state.displayingUserList.splice(index, 1);
      document.getElementById(user).classList.remove('user-selected');
    }
  },
  changeCCTType(state, dataType) {
    state.CCTType[dataType] = !state.CCTType[dataType];
  },
  changeInterval(state, interval) {
    state.interval = interval;
    state.hasCalculated = {};
  },
  createLabels(state) {
    console.log('createLabels start --------------');
    const { startTime, endTime } = getTimeSpan(state.studentList);
    const labels = makeRange(startTime, endTime, state.interval);
    state.timeRange = labels;
    console.log('createLabels end --------------');
  },
  createCCTFormTime(state) {
    console.log('createCCTFormTime start --------------');
    const keys = Object.keys(state.studentList);
    if (keys) {
      keys.forEach((key) => {
        state.studentList[key].cctTime = [];
      });
    }
    state.timeRange.forEach((label) => {
      keys.forEach((key) => {
        state.studentList[key].cctTime.push({
          time: label,
          concentrationArr: [],
          concentrationMean: {},
        });
      });
    });
    console.log('createCCTFormTime end --------------');
  },
  drawChart(state) {
    console.log('drawChart start --------------');
    state.datacollection = {
      labels: state.timeRange,
      datasets: [],
    };
    state.displayingUserList.forEach((userInfo, idx) => {
      const keys = Object.keys(state.CCTType);
      keys.forEach((key) => {
        if (state.CCTType[key]) {
          const { user, name } = userInfo;
          const dataset = addDataSet(
            `${name} - ${key}`,
            state.data[user][key],
            key,
            idx,
          );
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
    };

    const keys = Object.keys(state.CCTType);
    keys.forEach((key) => {
      if (state.CCTType[key]) {
        const dataset = addDataSet(key, state.data[key], key);
        state.datacollection.datasets.push(dataset);
      }
    });
    console.log('drawChartAllClass end --------------');
  },
  distributeCCTData(state, concentrations) {
    console.log('distributeCCTData start --------------');
    concentrations.forEach((concentration) => {
      state.studentList[concentration.user].cctTotal.push(concentration);
    });
    console.log(state.studentList);
    console.log('distributeCCTData end --------------');
  },
  distributeCCTDataAllClass(state, payload) {
    const { classList, CCTData } = payload;
    state.timeRange = [];
    classList.forEach((classInfo) => {
      const startDay = classInfo.startTime.slice(5, 10);
      const classTopic = classInfo.name;
      state.timeRange.push(`${startDay} \n ${classTopic}`);
    });
    state.data = {
      focusPoint: [],
      attendPer: [],
      sleepPer: [],
    };
    CCTData.forEach((cct) => {
      state.data.focusPoint.push(cct.avgFocusPoint);
      state.data.attendPer.push(cct.avgAttendPer);
      state.data.sleepPer.push(cct.avgSleepPer);
    });
  },
  resetData(state) {
    console.log('-------- reset data start--------');
    const keys = Object.keys(state.studentList);
    if (keys) {
      keys.forEach((key) => {
        state.studentList[key].cctTotal = [];
        state.studentList[key].cctTime = [];
      });
    }
    state.data = {};
    state.hasCalculated = {};
    console.log('-------- reset data end--------');
  },
  resetVariables(state) {
    state.displayingUserList = [];
    state.CCTType = {
      focusPoint: true,
      attendPer: false,
      sleepPer: false,
    };
    state.datacollection = null;
    state.timeRange = [];
    state.data = {};
    state.hasCalculated = {};
    state.interval = 5;
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
  ChangeInterval({ commit }, interval) {
    commit('changeInterval', interval);
  },
  CreateCCTFormTime({ commit }) {
    commit('createCCTFormTime');
  },
  DistributeCCTData({ commit }, concentrations) {
    commit('resetData');
    commit('distributeCCTData', concentrations);
  },
  DisplayData({ commit }, selectedType) {
    if (selectedType === '전체') {
      commit('drawChartAllClass');
    } else {
      commit('calculateAverageCCTData');
      commit('drawChart');
    }
  },
  DrawChartAllClass({ commit }, payload) {
    commit('distributeCCTDataAllClass', payload);
    commit('drawChartAllClass');
  },
  ResetVariables({ commit }) {
    commit('resetVariables');
  },
  SetStudentList({ commit }, options) {
    console.log(options);
    return fetchUserList(options.jwt, options.params)
      .then(({ data }) => commit('setStudentList', data))
      .catch((error) => console.error(error));
  },
};

function addDataSet(label, data, key, idx = -1) {
  return {
    label,
    borderColor: chooseColor(key, idx),
    data,
    fill: false,
  };
}

function compareDateinDate(a, b) {
  return a.valueOf() && b.valueOf() ? (a > b) - (a < b) : NaN;
}
/* eslint no-else-return: "error" */
function compareDateinString(a, b) {
  const splitA = a.split(':');
  const splitB = b.split(':');
  for (let i = 0; i < 3; i += 1) {
    if (Number(splitA[i]) > Number(splitB[i])) {
      return true;
    } else if (Number(splitA[i]) < Number(splitB[i])) {
      return false;
    }
  }
  return true;
}
function addInterval(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
function makeRange(sTime, eTime, interval) {
  const labels = [];
  let time = sTime;
  while (compareDateinDate(time, eTime) < 1) {
    const splits = time.toString().split(' ');
    labels.push(splits[4]);
    time = addInterval(time, interval);
  }
  return labels;
}

function getTimeSpan(studentList) {
  let startTime = new Date('2050-10-09T06:18:33.674Z');
  let endTime = new Date('2010-10-09T06:18:33.674Z');
  const keys = Object.keys(studentList);
  keys.forEach((key) => {
    const { cctTotal } = studentList[key];
    const length = cctTotal.length - 1;
    if (cctTotal[0]) {
      const firstData = new Date(cctTotal[0].date);
      const lastData = new Date(cctTotal[length].date);
      startTime =
        compareDateinDate(startTime, firstData) === -1 ? startTime : firstData;
      endTime = compareDateinDate(endTime, lastData) === 1 ? endTime : lastData;
    }
  });
  startTime.setSeconds(0, 0);
  endTime.setSeconds(0, 0);
  return { startTime, endTime };
}

// 성능 개선 필요.
function divideDataPerInterval(student) {
  student.cctTotal.forEach((cctTotal) => {
    const date = new Date(cctTotal.date);
    date.setSeconds(0, 0);
    const time = date.toString().split(' ')[4];
    student.cctTime.some((cctTime) => {
      if (compareDateinString(cctTime.time, time)) {
        cctTime.concentrationArr.push(cctTotal.status);
        return true;
      }
      return false;
    });
  });
}

function chooseColor(key, idx) {
  const remainder = idx % 7;
  let color;
  switch (remainder) {
    case 0:
      color = '204, 0, 0';
      break;
    case 1:
      color = '255, 153, 0';
      break;
    case 2:
      color = '255, 255, 0';
      break;
    case 3:
      color = '0, 153, 51';
      break;
    case 4:
      color = '0, 153, 255';
      break;
    case 5:
      color = '0, 0, 153';
      break;
    default:
      color = '153, 0, 204';
  }
  if (key === 'attendPer') return `rgba(${color}, 0.1)`;
  if (key === 'focusPoint') return `rgba(${color}, 1.0)`;
  return `rgba(${color}, 0.4)`;
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
