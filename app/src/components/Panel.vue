<template>
  <div class="panel">
    <h3 class="title">{{ title }}</h3>
    <slot />
  </div>
</template>

<script>
export default {
  props: ['title'],
};
</script>

<style lang="scss" scoped>
.panel {
  margin-bottom: 30px;
  border: 1px black solid;
  padding: 20px 15px;

  .title {
    margin-top: 0px;
    border-bottom: 1px black solid;
    padding-bottom: 20px;

    // TODO: probably refactor this to be less weird
    padding-left: 15px;
    margin-left: -15px;
    margin-right: -15px;
  }

  /deep/ p:last-child {
    margin-bottom: 0px;
  }
}
</style>

