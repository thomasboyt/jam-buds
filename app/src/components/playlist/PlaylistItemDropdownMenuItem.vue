<template>
  <li class="menu-item">
    <slot />
  </li>
</template>

<style scoped lang="scss">
.menu-item {
  a,
  a:visited,
  button {
    display: block;
    white-space: nowrap;
    padding: 5px 20px;
    font-size: 14px;
    color: rgb(100, 100, 100);
    width: 100%;
    text-align: left;
    text-decoration: none;

    &:hover {
      background: rgb(225, 225, 225);
    }

    &:active {
      transform: none;
    }
  }
}
</style>
