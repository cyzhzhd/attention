# WebRTC
### getting started
```
signaling server 시작  
cd signaling
node signaling

from typescript to javascript
tsc filename 
or tsc 
tsc = converts all file
```
# Firebase
### getting started  
``` 
cd electron-vue
yarn or npm install  
yarn run dev or npm run dev  
```
**File descriptions**  
src/main/index.js = electron main file(main procecss)  
src/index.ejs = vue default html file  
src/renderer/main.js = vue main file  
src/renderer/router = vue router  
src/renderer/store = vuex  
src/renderer/components = vue rendering page  
## prototype v 0.0.1
### user scenario
로그인 --> 방 목록에서 방 선택 --> 방 입장 --> 대화 진행

### implements

Login = 닉네임을 이용한 일회성 로그인  
방 목록 표시 = firestore를 이용해 방 정보 적재  
채팅 표시 = firestore를 이용해 채팅 정보 적재  
firestore 구조: root - collection('rooms') - documents('room') - collection('messages') - documents('message')  
----------------------------------------------- 방 이름-------------------------------------- 발송자  
--------------------------------------------- 방 생성 시기----------------------------------발송 시기


## prototype v 0.0.2
### implements
방에 참가 중인 유저 목록 표시  
방 안에서 chat mode, video mode 전환  
### 문제
face-recognition과 합칠 시 gitlab push error
face-recognition과 합치면, face.api module error 발생

## 기타
### 버전

- node v12.18.2
- npm v6.14.5
- yarn v1.22.4


### references  
electron-vue boilerplate: https://github.com/SimulatedGREG/electron-vue  
firebase: https://firebase.google.com/  
vue: https://vuejs.org/
electron: https://www.electronjs.org/apps  
