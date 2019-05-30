<template>
  <div class="logo">
    <router-link to="/">jam buds!</router-link>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  display: inline-block;
  background: hotpink;
  box-shadow: yellow 15px 15px;

  font-size: 18px;
  padding: 10px;
  font-weight: bold;
  transform: skewY(-5deg);

  a,
  a:visited {
    color: yellow;
    text-decoration: none;
  }
}

.logo:hover {
  animation: throb 0.7s ease-in-out infinite alternate;
  cursor: pointer;
}

@keyframes throb {
  0% {
    transform: scale(1) skewY(-5deg) rotate(0deg);
  }

  100% {
    background: purple;
    transform: scale(1.5) skewY(-5deg) rotate(5deg);
  }
}
</style>