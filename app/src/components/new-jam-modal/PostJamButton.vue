<template>
  <jb-button
    class="post-button"
    data-test="post-jam-button"
    button-style="full-width"
  >
    <slot />
  </jb-button>
</template>

<script lang="ts">
import Vue from 'vue';
import JbButton from '../lib/JbButton.vue';

export default Vue.extend({
  components: { JbButton },
});
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
