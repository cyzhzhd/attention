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
  await detectorModel.loadFromUri(
    'https://be.swm183.com:3000/download/detector/model.json',
  );
  await landmarkModel.loadFromUri(
    'https://be.swm183.com:3000/download/landmark/model.json',
  );
}

function startAnalyze(stopFlagInput) {
  stopFlag = stopFlagInput;
  setTimeout(async function faceDetection() {
    if (stopFlag) {
      al.varInit();
      return;
    }
    const pixel = tfjs.browser.fromPixels(video);
    const img = pixel.reshape([-1, pixel.shape[0], pixel.shape[1], 3]);
    const detectImg = tfjs.image.resizeBilinear(img, [128, 128]);
    const [bbox, conf] = await detectorModel.predict(detectImg);
    const [angle, landmark] = await landmarkModel.predict(bbox, img);
    const timeInit = new Date();
    const focusPoint = al.analysis(bbox, landmark, angle, timeInit);
    drawLandmark(bbox, conf, landmark, focusPoint);
    tfjs.dispose([landmark, detectImg, angle, pixel, img]);
    setTimeout(faceDetection, 200);
  }, 0);
}

function drawLandmark(bbox, conf, landmark, point) {
  const canvas = document.getElementById("fcanvas");
  const ctx = canvas.getContext("2d");
  drawAll(canvas, ctx, bbox, conf, landmark, point);
}

function drawAll(canvas, ctx, bbox, conf, landmarkObj, point) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (point < 45) {
    ctx.fillStyle = '#FF0000';
    ctx.strokeStyle = '#FF0000';
  }
  else if (point < 75) {
    ctx.fillStyle = '#0000FF';
    ctx.strokeStyle = '#0000FF';
  }
  else {
    ctx.fillStyle = '#00FF00';
    ctx.strokeStyle = '#00FF00';
  }
  ctx.font = '30px Arial';
  ctx.lineWidth = '3';

  if (bbox !== undefined) {
    ctx.font = '30px Arial';
    ctx.beginPath();
    ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
    // ctx.fillText(conf.toFixed(2), bbox[0] + 15, bbox[1] + 30);
    // ctx.fillText(conf.bbox[0] + 15, bbox[1] + 30);
    ctx.stroke();
    for (let i = 0; i < 68; ++i) {
      ctx.fillRect(landmarkObj[i]['_x'], landmarkObj[i]['_y'], 3, 3);
    }
  }
}

export default {
  getVideoSrc,
  startAnalyze,
};
