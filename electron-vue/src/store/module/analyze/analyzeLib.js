/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */

import * as tfjs from '@tensorflow/tfjs';
import { landmarkModel } from './landmark';
import { detectorModel } from './detector';
import al from './algorithm';

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
    const detectImg = tfjs.image.resizeBilinear(img, [128, 128]);
    const [bbox, conf] = await detectorModel.predict(detectImg);
    const [angle, landmark] = await landmarkModel.predict(bbox, img);
    const timeInit = new Date();
    al.analysis(bbox, landmark, angle, timeInit);
    tfjs.dispose([landmark, detectImg, angle, pixel, img]);
    setTimeout(faceDetection, 0);
  }, 0);
}

export default {
  getVideoSrc,
  startAnalyze,
};
