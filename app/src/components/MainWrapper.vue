<template>
  <div class="main">
    <div class="main-inner">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss">
// todo replace this with user color schemes?
.main {
  background: rgb(189, 242, 113);

  a {
    color: rgb(1, 162, 166);
  }
}

button.follow-toggle {
  background: yellow;
}
</style>
