<template>
  <jb-button
    class="post-button"
    data-test="post-jam-button"
    button-style="full-width"
  >
    <slot />
  </jb-button>
</template>

<script>
import JbButton from '../lib/JbButton';

export default {
  components: { JbButton },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.post-button {
  margin-top: auto;
  color: $black;
  padding: 12px 0;
  background-color: hotpink;
  font-weight: bold;
  font-size: 1.5em;
}
</style>
