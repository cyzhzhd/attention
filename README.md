# FE

## electron-vue

[electron-vue builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/) 사용

```
To start a Development Server
cd electron-vue
yarn run electron:serve
```
yarn으로 실행할 것
## flex & grid 
[flex&grid guide](https://studiomeal.com/archives/533)

# webRTC

### signaling server
express server에 얹혀있음 (port: 3000)  

### STUN, TURN, Media server
STUN, TURN server = [COTURN Project](https://github.com/coturn/coturn)  
TURN 서버 작동 확인 방법 = [trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)  
  
Media server = [media soup](https://mediasoup.org/)  
Media server는 Linux 환경에서만 작동    
윈도우 환경에서 Linux 사용 방법 = [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)  
  


### N:M 연결 방법

1. Full Mesh Network
2. [Hierarchical Network ](https://www.ciscopress.com/articles/article.asp?p=2202410&seqNum=4#:~:text=A%20hierarchical%20network%20design%20involves,role%20within%20the%20overall%20network.&text=The%20benefit%20of%20dividing%20a,that%20local%20traffic%20remains%20local.)
3. [Small world network ](http://www.scholarpedia.org/article/Small-world_network)

1 -> 2 -> 3단계 순서로 단계적 적용 
현재는 Small world network를 커스텀하여 사용중  
[네트워크 대역폭 비교](https://13.125.91.162/swmaestro/183-1/-/wikis/Network-Topology-Analysis)



#### 구현 방법 
##### 새로 입장한 유저 
1. 기존에 방에 있던 유저들에게 signaling server를 이용해 자신의 정보(session ID)를 넘긴다.
2. 기존에 있던 유저 정보를 signaling server로부터 받아와 각각의 peerconnection 객체를 만든다. 
3. 만든 peerconnection을 이용해 offer한다. 

##### 방에 있던 기존 유저 
1. 기존 연결 유저 목록에 새로운 유저에 대한 peerconnection 객체를 추가한다. 
2. offer를 받으면 answer한다. 


### 음질 개선
1. EchoCancellation은 default로 적용되어 있음.
2. 크롬에선 다른 소스에서 나오는 소리는 에코 캔슬링이 안됨. Ex 유튜브 영상, zoom에서 나오는 소리
3. Safari에서는 non-webRTC audio도 echo cancelling 가능

[webRTC Echo cancellation, noise suppression](https://chromium.googlesource.com/external/webrtc/+/b3b79b611597f44c1d2b29f2d833b6d5928d7a68/webrtc/modules/audio_processing/include/audio_processing.h)
  
line 582

#### Noise Cancelling
1. DSP Algorithm = 
    딥러닝으로 깨끗한 Signal 1과 noise Signal 2를 합쳐 Signal 3을 만듦.
    딥러닝 베이스 소프트웨어로 signal 2를 불리해 냄.

2. [Least Mean Square Algorithm](https://kr.mathworks.com/help/dsp/examples/acoustic-noise-cancellation-lms.html)



