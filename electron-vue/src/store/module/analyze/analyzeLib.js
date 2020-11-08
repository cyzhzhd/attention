/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable dot-notation */
/* eslint-disable prefer-const */

import * as tfjs from '@tensorflow/tfjs';
import { landmarkModel } from './landmark';
import { detectorModel } from './detector';
import al from './algorithm copy';

let video;
let stopFlag = true;

async function getVideoSrc(videoSrc) {
  video = videoSrc;
  // console.log(video);
  await detectorModel.loadFromUri(
    'https://be.swm183.com:3000/download/detector/model.json',
  );
  await landmarkModel.loadFromUri(
    'https://be.swm183.com:3000/download/landmark/model.json',
  );
  // console.log(detectorModel, landmarkModel);
  // startAnalye(video);
}

function startAnalyze(stopFlagInput) {
  stopFlag = stopFlagInput;
  setTimeout(async function faceDetection() {
    if (stopFlag) {
      al.varInit();
      return;
    }
    // console.log(timestamp1)
    const pixel = tfjs.browser.fromPixels(video);
    const img = pixel.reshape([-1, pixel.shape[0], pixel.shape[1], 3]);
    // console.log(pixel.shape[0], pixel.shape[1]);
    const detectImg = tfjs.image.resizeBilinear(img, [128, 128]);
    const [bbox, conf] = await detectorModel.predict(detectImg);
    const [angle, landmark] = await landmarkModel.predict(bbox, img);
    const timeInit = new Date();
    al.analysis(bbox, landmark, angle, timeInit);
    drawLandmark(bbox, conf, landmark);
    tfjs.dispose([landmark, detectImg, angle, pixel, img]);
    setTimeout(faceDetection, 0);
  }, 0);
}

function drawLandmark(bbox, conf, landmark) {
  // console.log("suc");
  const canvas = document.getElementById("fcanvas");
  // console.log(canvas);
  const ctx = canvas.getContext("2d");
  // document.body.append(canvas);

  drawAll(canvas, ctx, bbox, conf, landmark, 100);
}


function drawAll(canvas, ctx, bbox, conf, landmarkObj, result) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // console.log('ddd');
  ctx.fillStyle = '#FF0000';
  ctx.strokeStyle = '#FF0000';
  ctx.font = '30px Arial';
  ctx.lineWidth = '4';

  if (bbox !== undefined) {
    console.log('okok');
    ctx.font = '30px Arial';
    ctx.beginPath();
    ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
    ctx.fillText(conf.toFixed(2), bbox[0] + 15, bbox[1] + 30);
    ctx.stroke();
    for (let i = 0; i < 68; ++i) {
      ctx.fillRect(landmarkObj[i]['_x'], landmarkObj[i]['_y'], 4, 4);
    }
  }
  // drawInfo(ctx, result);
}

// function drawInfo(ctx, result) {
//     ctx.fillText("score: " + result, 10, 20);
//     ctx.font = "12px Arial";
//     // var lines = JSON.stringify(status, null, 2).split("\n");
//     var lines = low_data.split("\n");
//     for (var j = 0; j < lines.length; j++)
//         ctx.fillText(lines[j], 10, 240 + j * 20);
//     ctx.font = "14px Arial";
//     ctx.fillText(JSON.stringify(tfjs.memory()), 20, 470);
// }

export default {
  getVideoSrc,
  startAnalyze,
};
