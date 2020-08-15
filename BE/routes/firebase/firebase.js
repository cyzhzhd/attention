const express = require('express');
const router = express.Router();
// var admin = require('firebase-admin');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const firebaseConfigKey = require('./firebaseConfigKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://soma-team-183.firebaseio.com',
});

const db = admin.database();

router.get('/', (req, res, next) => {
  res.json(firebaseConfigKey);
});

router.post('/roomList', function (req, res, next) {
  const { roomName, host } = req.body;

  const newPostRef = db.ref('/rooms').push({
    roomName,
    host,
  });

  const postId = newPostRef.key;
  db.ref('/messageHub/' + postId + '/messages').push({
    message: host + ' created ' + roomName,
    sender: 'bot',
    sentAt: admin.database.ServerValue.TIMESTAMP,
  });

  db.ref('/messageHub/' + postId).update({
    roomName,
  });

  res.status(201);
});

router.post('/message', async function (req, res, next) {
  const { roomId, nickname, message } = req.body;

  db.ref('/messageHub/' + roomId + '/messages').push({
    sender: nickname,
    message,
    sentAt: admin.database.ServerValue.TIMESTAMP,
  });
  res.status(201);
});

module.exports = router;
