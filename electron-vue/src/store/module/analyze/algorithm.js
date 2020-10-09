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
    cutIndexP: 0,
    cutIndexY: 0,
    cutIndexR: 0,
    secLengthP: 0,
    secLengthY: 0,
    secLengthR: 0,
}

let eyeVar = {
    inHeightR: 0,
    inHeightL: 0,
    outHeightR: 0,
    outHeightL: 0,
    widthR: 0,
    widthL: 0,
    ratioR: 0,
    ratioL: 0,
    EAR: 0,
    arrEAR: [],
    avgEAR: 0,
    maxEAR: studentData.eyeSize,
    minEAR: studentData.blinkSize,
    weight: 1,
    closedRatio: 0,

    secLength: 0,
    timeSave: 0,
    timeChange: true,
    secFlag: true,
}

let pointVar = {
    deltaRatio: 0,
    mouseRatio: 0,
    eyeRatio: 0,
    mouseW: 0,
    mouseH: 0,

    timeChange: true,
    timeChange2: true,
    timeSave: 0,
    timeSave2: 0,
    tempEAR: 0,
    tempPoint: 100,
    secFlag: true,
    secLength: 0,
    arrPoint: [],
    eyeW: 0,
    deltaW: 0,
    mouseWw: 0,
    cutIndex: 0,
}

function varInit() {
    detectVar.arrDetect = [];
    detectVar.timeChange = true;
    detectVar.secFlag = true;
    eyeVar.arrEAR = [];
    eyeVar.timeChange = true;
    eyeVar.secFlag = true;
    angleVar.arrPitch = [];
    angleVar.arrYaw = [];
    angleVar.arrRoll = [];
    angleVar.timeChange = true;
    angleVar.secFlag = true;
    pointVar.timeChange = true;
    pointVar.timeChange2 = true;

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
        // eyeVar.secFlag = true;
        eyeVar.timeSave = timestamp;
        // eyeVar.secLength = eyeVar.arrEAR.length;
    }
    if (pointVar.timeChange) {
        pointVar.timeChange = false;
        pointVar.timeSave = timestamp;
    }
    eyeVar.inHeightL = calcDist(landmarks[43], landmarks[47]);
    eyeVar.outHeightL = calcDist(landmarks[44], landmarks[46]);
    eyeVar.widthL = calcDist(landmarks[42], landmarks[45]);
    eyeVar.inHeightR = calcDist(landmarks[38], landmarks[40]);
    eyeVar.outHeightR = calcDist(landmarks[37], landmarks[41]);
    eyeVar.widthR = calcDist(landmarks[36], landmarks[39]);

    eyeVar.ratioL = (eyeVar.inHeightL + eyeVar.outHeightL) / (2 * eyeVar.widthL);
    eyeVar.ratioR = (eyeVar.inHeightR + eyeVar.outHeightR) / (2 * eyeVar.widthR);
    eyeVar.EAR = (eyeVar.ratioL + eyeVar.ratioR) / 2;

    pointVar.mouseW = calcDist(landmarks[48], landmarks[54]);
    pointVar.mouseH =
        (calcDist(landmarks[50], landmarks[58]) +
            calcDist(landmarks[51], landmarks[57]) +
            calcDist(landmarks[52], landmarks[56])) /
        3;
    pointVar.mouseRatio = pointVar.mouseH / pointVar.mouseW;
    const tempTime1 = new Date();
    if (tempTime1.getTime() - pointVar.timeSave.getTime() > 1000) {
        pointVar.timeChange = true;
        pointVar.deltaRatio = Math.abs(eyeVar.EAR - pointVar.tempEAR);
        pointVar.tempEAR = eyeVar.EAR;
    }

    eyeVar.arrEAR.push(eyeVar.EAR);
    eyeVar.avgEAR = (eyeVar.arrEAR.reduce((a, b) => a + b)) / eyeVar.arrEAR.length;
    if (eyeVar.avgEAR > eyeVar.maxEAR) eyeVar.weight = 0.1;
    else if (eyeVar.avgEAR < eyeVar.minEAR) eyeVar.avgEAR = studentData.blinkSize;
    else eyeVar.weight = 1 + Math.pow(Math.abs(eyeVar.avgEAR), 2) - 20 * Math.pow(angleVar.pitch, 2);
    if (angleVar.pitch < 0 || angleVar.pitch > 0.18) eyeVar.weight = 0.1;
    eyeVar.closedRatio = ((eyeVar.weight * Math.abs(studentData.eyeSize - eyeVar.avgEAR)) / (studentData.eyeSize - studentData.blinkSize)).toFixed(3);
    pointVar.eyeRatio = eyeVar.avgEAR;
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
    if (pointVar.timeChange2) {
        pointVar.timeChange2 = false;
        // pointVar.secFlag = true;
        pointVar.timeSave2 = timestamp;
        // pointVar.secLength = pointVar.arrPoint.length;
    }
    if (pointVar.eyeRatio < 0.15) pointVar.eyeW = 0;
    else if (pointVar.eyeRatio < 0.27) pointVar.eyeW = 6.67 * (pointVar.eyeRatio - 0.27) + 0.8;
    else if (pointVar.eyeRatio < 0.34) pointVar.eyeW = 0.8;
    else if (pointVar.eyeRatio < 0.4) pointVar.eyeW = 3.34 * (pointVar.eyeRatio - 0.4) + 1;
    else pointVar.eyeW = 1;

    if (pointVar.deltaRatio < 0) pointVar.deltaW = 0;
    else if (pointVar.deltaRatio < 0.125)
        pointVar.deltaW = 6.4 * (pointVar.deltaRatio - 0.125) + 0.8;
    else if (pointVar.deltaRatio < 0.1875) pointVar.deltaW = 0.8;
    else if (pointVar.deltaRatio < 0.258)
        pointVar.deltaW = 2.82 * (pointVar.deltaRatio - 0.258) + 1;
    else pointVar.deltaW = 1;

    if (pointVar.mouseRatio < 0.5) pointVar.mouseWw = 1;
    else if (pointVar.mouseRatio < 0.8)
        pointVar.mouseWw = -5.56 * Math.pow(pointVar.mouseRatio - 0.5, 2) + 1;
    else if (pointVar.mouseRatio < 1.2)
        pointVar.mouseWw = 3.125 * Math.pow(pointVar.mouseRatio - 1.2, 2);
    else pointVar.mouseWw = 0;

    pointVar.arrPoint.push(((pointVar.eyeW * 2.5 + pointVar.deltaW * 1 + pointVar.mouseWw * 6.5) * 100) / 10);
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
        pointVar.timeChange2 = true;
        judge.focusPoint = pointVar.tempPoint.toFixed(2);
        // pointVar.arrPoint.splice(0, pointVar.cutIndex);
        pointVar.arrPoint.length = 0;
    }
}

export default {
    analysis,
    varInit
}