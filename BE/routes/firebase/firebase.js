const express = require('express');
const router = express.Router();
// var admin = require('firebase-admin');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://soma-team-183.firebaseio.com',
});

const db = admin.database();

router.get('/roomList', function (req, res, next) {
  db.ref('/rooms').on(
    'value',
    (snapshot) => {
      res.json(snapshot.val());
    },
    (errorObject) => {
      console.log('The read failed: ' + errorObject.code);
    }
  );
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
    createdAt: new Date(),
  });

  res.status(201);
});

router.get('/message', function (req, res, next) {
  const roomId = req.query.roomId;

  db.ref('/messageHub/' + roomId + '/messages').on(
    'value',
    (snapshot) => {
      console.log('messageHub= ', snapshot.val());
      res.json(snapshot.val());
    },
    (errorObject) => {
      console.log('The read failed: ' + errorObject.code);
    }
  );
});

router.post('/message', async function (req, res, next) {
  const { roomId, nickname, message } = req.body;
  console.log('roomId, nickname, message', roomId, nickname, message);

  db.ref('/messageHub/' + roomId + '/messages').push({
    sender: nickname,
    message,
    createdAt: new Date(),
  });
  res.status(201);
});

module.exports = router;
