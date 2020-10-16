/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-underscore-dangle */

import rtcPart from "../webRTC/rtcPart";

let judge = {
    absence: 0,    // absence ratio for x sec
    sleep: 0,      // sleep ratio for x sec
    turnHead: 0,   // turn head ratio for x sec
    focusPoint: 100,   // focus point
}

let teacherData = {
    period: [5, 5, 5, 5],
    threshold: [0.5, 0.5, 0.5],
    priority: [1, 2, 3, 4],
}

let studentData = {
    eyeSize: 0.28,
    blinkSize: 0.15,
}

let detectVar = {
    arrDetect: [],
    cntDetect: 0,
    cntUndetect: 0,
    wDetect: 0,
    wUndetect: 0,

    absenceTemp: 0,    // 1 frame
    secLength: 0,
    timeSave: 0,
    timeChange: true,
    secFlag: true,
}

let angleVar = {
    arrPitch: [],
    arrYaw: [],
    arrRoll: [],
    pitch: 0,
    yaw: 0,
    roll: 0,
    weight: 0,
    turnRatio: 0,

    timeChange: true,
    timeSave: 0,
    secFlag: true,
}

let eyeVar = {
    arrEAR: [],
    maxEAR: studentData.eyeSize,
    minEAR: studentData.blinkSize,
    arrSet: [],
    weight: 1,
    closedRatio: 0,

    timeSave: 0,
    timeChange: true,
}

let pointVar = {
    deltaRatio: 0,
    mouseRatio: 0,
    eyeRatio: 0,

    deltaTimeChange: true,
    pointTimeChange: true,
    deltaTimeSave: 0,
    timeSave2: 0,
    tempEAR: 0,
    tempPoint: 100,
    secFlag: true,
    secLength: 0,
    arrPoint: [],
    eyeWeight: 0,
    deltaWeight: 0,
    mouseWeight: 0,
}

function varInit() {
    detectVar.arrDetect = [];
    detectVar.timeChange = true;
    eyeVar.arrEAR = [];
    eyeVar.timeChange = true;
    angleVar.arrPitch = [];
    angleVar.arrYaw = [];
    angleVar.arrRoll = [];
    angleVar.timeChange = true;
    pointVar.deltaTimeChange = true;
    pointVar.pointTimeChange = true;

}

function analysis(detection, landmarks, angle, timestamp) {
    // detection part

    if (detectVar.timeChange) {
        detectVar.timeChange = false;
        // detectVar.secFlag = true;
        detectVar.timeSave = timestamp;
        // detectVar.secLength = detectVar.arrDetect.length;
    }

    if (detection) detectVar.arrDetect.push(1);
    else detectVar.arrDetect.push(0);
    detectVar.cntDetect = detectVar.arrDetect.reduce((a, b) => a + b);
    detectVar.cntUndetect = detectVar.arrDetect.length - detectVar.cntDetect;
    detectVar.wDetect = 5 * Math.pow(detectVar.cntDetect, 3);
    detectVar.wUndetect = 5 * Math.pow(detectVar.cntUndetect, 3);
    detectVar.absenceTemp = ((1 * detectVar.wDetect) / (detectVar.wDetect + detectVar.wUndetect)).toFixed(3);
    // console.log(detectVar.absenceTemp);

    const tempTime = new Date();
    // if (tempTime.getTime() - detectVar.timeSave.getTime() > 2000)   {
    //     if(detectVar.secFlag)   {
    //         detectVar.secFlag = false;
    //         detectVar.cutIndex = detectVar.arrDetect.length - detectVar.secLength;
    //     }
    // }
    if (tempTime.getTime() - detectVar.timeSave.getTime() > teacherData.period[0] * 1000) {
        detectVar.timeChange = true;
        judge.absence = 1 - detectVar.absenceTemp;
        // console.log(judge.absence);
        // detectVar.arrDetect.splice(0, detectVar.cutIndex);
        detectVar.arrDetect.length = 0;
        rtcPart.sendMessage('sendConcentration', {
            content: judge,
        });
        console.log("absence : ", judge.absence, "sleep : ", judge.sleep, "turn : ", judge.turnHead, "point : ", judge.focusPoint);
    }

    //
    if (landmarks) {
        analyzeFaceExpression(landmarks, timestamp);
        analyzeAngle(angle, timestamp);
        pointCal(timestamp);
    }
}

function analyzeFaceExpression(landmarks, timestamp) {
    if (eyeVar.timeChange) {
        eyeVar.timeChange = false;
        eyeVar.timeSave = timestamp;
    }
    if (pointVar.deltaTimeChange) {
        pointVar.deltaTimeChange = false;
        pointVar.deltaTimeSave = timestamp;
    }
    const inHeightL = calcDist(landmarks[43], landmarks[47]);
    const outHeightL = calcDist(landmarks[44], landmarks[46]);
    const widthL = calcDist(landmarks[42], landmarks[45]);
    const inHeightR = calcDist(landmarks[38], landmarks[40]);
    const outHeightR = calcDist(landmarks[37], landmarks[41]);
    const widthR = calcDist(landmarks[36], landmarks[39]);

    const ratioL = (inHeightL + outHeightL) / (2 * widthL);
    const ratioR = (inHeightR + outHeightR) / (2 * widthR);
    const EAR = (ratioL + ratioR) / 2;

    const mouseW = calcDist(landmarks[48], landmarks[54]);
    const mouseH =
        (calcDist(landmarks[50], landmarks[58]) +
            calcDist(landmarks[51], landmarks[57]) +
            calcDist(landmarks[52], landmarks[56])) /
        3;
    pointVar.mouseRatio = mouseH / mouseW;
    const tempTime1 = new Date();
    if (tempTime1.getTime() - pointVar.deltaTimeSave.getTime() > 1000) {
        pointVar.deltaTimeChange = true;
        pointVar.deltaRatio = Math.abs(EAR - pointVar.tempEAR);
        pointVar.tempEAR = EAR;
    }

    eyeVar.arrEAR.push(EAR);
    const avgEAR = (eyeVar.arrEAR.reduce((a, b) => a + b)) / eyeVar.arrEAR.length;
    if (avgEAR > eyeVar.maxEAR) eyeVar.weight = 0.1;
    else if (avgEAR < eyeVar.minEAR) avgEAR = studentData.blinkSize;
    else eyeVar.weight = 1 + Math.pow(Math.abs(avgEAR), 2) - 20 * Math.pow(angleVar.pitch, 2);
    if (angleVar.pitch < 0 || angleVar.pitch > 0.18) eyeVar.weight = 0.1;
    eyeVar.closedRatio = ((eyeVar.weight * Math.abs(studentData.eyeSize - avgEAR)) / (studentData.eyeSize - studentData.blinkSize)).toFixed(3);
    pointVar.eyeRatio = avgEAR;
    // console.log("sleep : ", eyeVar.closedRatio);
    const tempTime2 = new Date();
    // if (tempTime2.getTime() - eyeVar.timeSave.getTime() > 2000) {
    //     if (eyeVar.secFlag) {
    //         eyeVar.secFlag = false;
    //         eyeVar.cutIndex = eyeVar.arrEAR.length - eyeVar.secLength;
    //         eyeVar.secLength = eyeVar.arrEAR.length;
    //     }
    // }
    if (tempTime2.getTime() - eyeVar.timeSave.getTime() > teacherData.period[1] * 1000) {
        eyeVar.timeChange = true;
        judge.sleep = eyeVar.closedRatio;
        // console.log("sleep : ", judge.sleep);
        // eyeVar.arrEAR.splice(0, eyeVar.cutIndex);
        eyeVar.arrEAR.length = 0;
    }

}

// function eyeSetting(flag, now) {
//     if (flag) {
//         flag = false;
//         const temp = now;
//     }
//     eyeVar.arrSet.push(eyeVar.avgEAR);
//     const settingTime = new Date();
//     if (settingTime.getTime() - now.getTime() > 5 * 1000) {
//         let arrBlink = [];
//         eyeVar.arrSet.sort((a, b) => a - b);
//         arrBlink = calcEdge(eyeVar.arrSet);
//         eyeVar.maxEAR = eyeVar.arrSet[-1];
//         eyeVar.minEAR = arrBlink[0];
//         studentData.eyeSize = eyeVar.arrSet.reduce((a, b) => {
//             return a + b;
//         }, 0) / eyeVar.arrSet.length;
//         studentData.blinkSize = arrBlink.reduce((a, b) => {
//             return a + b;
//         }, 0) / arrBlink.length;
//         eyeVar.arrSet.length = 0;
//     }
// }

function calcDist(p1, p2) {
    return Math.sqrt(Math.pow(p1._x - p2._x, 2) + Math.pow(p1._y - p2._y, 2));
}

function analyzeAngle(angle, timestamp) {
    if (angleVar.timeChange) {
        angleVar.timeChange = false;
        // angleVar.secFlag = true;
        angleVar.timeSave = timestamp;
        // angleVar.secLengthP = angleVar.arrPitch.length;
        // angleVar.secLengthY = angleVar.arrYaw.length;
        // angleVar.secLengthR = angleVar.arrRoll.length;
    }
    angleVar.arrPitch.push(Number(angle[0][0].toFixed(3)));
    angleVar.arrYaw.push(Number(angle[0][1].toFixed(3)));
    angleVar.arrRoll.push(Number(angle[0][2].toFixed(3)));

    angleVar.pitch = (angleVar.arrPitch.reduce((a, b) => a + b)) / angleVar.arrPitch.length;
    angleVar.yaw = (angleVar.arrYaw.reduce((a, b) => a + b)) / angleVar.arrYaw.length;
    angleVar.roll = (angleVar.arrRoll.reduce((a, b) => a + b)) / angleVar.arrRoll.length;

    angleVar.weight = 0.8;
    angleVar.turnRatio = angleVar.weight * (Math.abs(angleVar.yaw) - 0) * (1 - 0) / (0.3 - 0) + 0;
    if (angleVar.turnRatio >= 1) angleVar.turnRatio = 1;

    const tempTime3 = new Date();
    // if (tempTime3.getTime() - angleVar.timeSave.getTime() > 3000) {
    //     if (angleVar.secFlag) {
    //         angleVar.secFlag = false;
    //         angleVar.cutIndexP = angleVar.arrPitch.length - angleVar.secLengthP;
    //         angleVar.cutIndexR = angleVar.arrYaw.length - angleVar.secLengthY;
    //         angleVar.cutIndexY = angleVar.arrRoll.length - angleVar.secLengthR;
    //     }
    // }
    if (tempTime3.getTime() - angleVar.timeSave.getTime() > teacherData.period[2] * 1000) {
        angleVar.timeChange = true;
        judge.turnHead = angleVar.turnRatio.toFixed(3);
        // angleVar.arrPitch.splice(0, angleVar.cutIndexP);
        // angleVar.arrYaw.splice(0, angleVar.cutIndexY);
        // angleVar.arrRoll.splice(0, angleVar.cutIndexR);
        angleVar.arrPitch.length = 0;
        angleVar.arrYaw.length = 0;
        angleVar.arrRoll.length = 0;
    }
    // (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function pointCal(timestamp) {
    if (pointVar.pointTimeChange) {
        pointVar.pointTimeChange = false;
        // pointVar.secFlag = true;
        pointVar.timeSave2 = timestamp;
        // pointVar.secLength = pointVar.arrPoint.length;
    }
    if (pointVar.eyeRatio < 0.15) pointVar.eyeWeight = 0;
    else if (pointVar.eyeRatio < 0.27) pointVar.eyeWeight = 6.67 * (pointVar.eyeRatio - 0.27) + 0.8;
    else if (pointVar.eyeRatio < 0.34) pointVar.eyeWeight = 0.8;
    else if (pointVar.eyeRatio < 0.4) pointVar.eyeWeight = 3.34 * (pointVar.eyeRatio - 0.4) + 1;
    else pointVar.eyeWeight = 1;

    if (pointVar.deltaRatio < 0) pointVar.deltaWeight = 0;
    else if (pointVar.deltaRatio < 0.125)
        pointVar.deltaWeight = 6.4 * (pointVar.deltaRatio - 0.125) + 0.8;
    else if (pointVar.deltaRatio < 0.1875) pointVar.deltaWeight = 0.8;
    else if (pointVar.deltaRatio < 0.258)
        pointVar.deltaWeight = 2.82 * (pointVar.deltaRatio - 0.258) + 1;
    else pointVar.deltaWeight = 1;

    if (pointVar.mouseRatio < 0.5) pointVar.mouseWeight = 1;
    else if (pointVar.mouseRatio < 0.8)
        pointVar.mouseWeight = -5.56 * Math.pow(pointVar.mouseRatio - 0.5, 2) + 1;
    else if (pointVar.mouseRatio < 1.2)
        pointVar.mouseWeight = 3.125 * Math.pow(pointVar.mouseRatio - 1.2, 2);
    else pointVar.mouseWeight = 0;

    pointVar.arrPoint.push(((pointVar.eyeWeight * 2.5 + pointVar.deltaWeight * 1 + pointVar.mouseWeight * 6.5) * 100) / 10);
    pointVar.tempPoint = (pointVar.arrPoint.reduce((a, b) => a + b)) / pointVar.arrPoint.length;

    const tempTime4 = new Date();
    // if (tempTime4.getTime() - pointVar.timeSave2.getTime() > 2000) {
    //     if (pointVar.secFlag) {
    //         pointVar.secFlag = false;
    //         pointVar.cutIndex = pointVar.arrPoint.length - pointVar.secLength;
    //         pointVar.secLength = pointVar.arrPoint.length;
    //     }
    // }
    if (tempTime4.getTime() - pointVar.timeSave2.getTime() > teacherData.period[3] * 1000) {
        pointVar.pointTimeChange = true;
        judge.focusPoint = pointVar.tempPoint.toFixed(2);
        // pointVar.arrPoint.splice(0, pointVar.cutIndex);
        pointVar.arrPoint.length = 0;
    }
}

export default {
    analysis,
    varInit,
    eyeSetting,

}