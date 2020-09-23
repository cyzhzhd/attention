<template>
  <div class="app">
    <!-- <div class="nav">
      <router-link class="router" to="/">Home</router-link>
      <router-link class="router" to="/about">About</router-link>
    </div>-->
    <router-view class="router-view" />
  </div>
</template>

<style lang="scss">
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  // display: grid;
  // grid-template-columns: minmax(70px, 5%) 1fr;
  // grid-template-areas: 'nav router-view';
}

.nav {
  display: flex;
  flex-direction: column;

  a {
    font-size: 1rem;
    font-weight: bold;
    color: #2c3e50;
    background: white;

    &.router-link-exact-active {
      color: #676ed4;
      background: #42b983;
    }
  }

  grid-area: nav;
}
.router {
  padding: 10px;
}

.router-view {
  grid-area: 'router-view';
}

html {
  font-family: 'Apple SD Gothic Neo', Roboto, 'Noto Sans KR', NanumGothic,
    'Malgun Gothic', sans-serif;
  color: #555;
  line-height: 1.2;
  word-wrap: break-word;
}
body {
  background: #eee;
  -webkit-font-smoothing: antialiased;
}
html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
}
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}
div,
span,
article,
section,
header,
footer,
aside,
p,
ul,
li,
fieldset,
legend,
label,
a,
nav,
form {
  box-sizing: border-box;
  /* content-box */
}
ol,
ul,
li {
  list-style: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
img {
  max-width: 100%;
  height: auto;
  border: 0;
}
a {
  display: inline-block;
}
button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.grid-container {
  padding: 10px;
  background: lightgray;
}
.grid-item {
  padding: 10px;
  border: 3px solid rgb(50, 50, 40);
  color: white;
  background: #ff6937;
}
</style>
