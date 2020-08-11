# webRTC

### signaling server

AWS를 이용한 signaling server  
Demon process 이용 (추가 예정)
PM2로 자동 업데이트 (추가 예정)

### STUN, TURN server

구글 STUN 서버 사용 중  
TURN 서버 구축 필요 시 COTRUN PROJECT 이용  
  


### N:M 연결 방법

1. Full Mesh Network
2. [Small world network ](http://www.scholarpedia.org/article/Small-world_network)
3. [Hierarchical Network ](https://www.ciscopress.com/articles/article.asp?p=2202410&seqNum=4#:~:text=A%20hierarchical%20network%20design%20involves,role%20within%20the%20overall%20network.&text=The%20benefit%20of%20dividing%20a,that%20local%20traffic%20remains%20local.)

이 중 Full Mesh Network를 사용  
가장 간단하고, 모두가 모두를 볼 수 있는 구조

# FE

## electron-vue

[electron-vue builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/) 사용

```
To start a Development Server
yarn run electron:serve
```

# BE

## Express

## DB

### firebase

### MongoDB
