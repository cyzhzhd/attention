# webRTC

### signaling server
express server에 얹혀있음 (port: 3000)  

### STUN, TURN server

구글 STUN 서버 사용 중  
TURN 서버 구축 필요 시 COTRUN PROJECT 이용  
  


### N:M 연결 방법

1. Full Mesh Network
2. [Small world network ](http://www.scholarpedia.org/article/Small-world_network)
3. [Hierarchical Network ](https://www.ciscopress.com/articles/article.asp?p=2202410&seqNum=4#:~:text=A%20hierarchical%20network%20design%20involves,role%20within%20the%20overall%20network.&text=The%20benefit%20of%20dividing%20a,that%20local%20traffic%20remains%20local.)

이 중 Full Mesh Network를 사용  
가장 간단하고, 모두가 모두를 볼 수 있는 구조  

#### 구현 방법 
##### 새로 입장한 유저 
1. 기존에 방에 있던 유저들에게 signaling server를 이용해 자신의 정보(session ID)를 넘긴다.
2. 기존에 있던 유저 정보를 signaling server로부터 받아와 각각의 peerconnection 객체를 만든다. 
3. 만든 peerconnection을 이용해 offer한다. 

##### 방에 있던 기존 유저 
1. 기존 연결 유저 목록에 새로운 유저에 대한 peerconnection 객체를 추가한다. 
2. offer를 받으면 answer한다. 

# FE

## electron-vue

[electron-vue builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/) 사용

```
To start a Development Server
yarn run electron:serve
```

## flex & grid 
[flex&grid guide](https://studiomeal.com/archives/533)
