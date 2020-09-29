// let video;

// export default function setVideoSource(element)    {
//     console.log("setVideoSource",element);
//     video = element;
//     console.log(video);
// }


// function initializer(video) {
//     console.log(video);
//     this.video = video;
//     console.log(this.video);
// }

// export default initializer;


// 동규씨코드

const aaa = {
    video: undefined,
}

function getVideoSrc(element)  {
    aaa.video = element;
    console.log(aaa.video);
}

export default {
    getVideoSrc
}



