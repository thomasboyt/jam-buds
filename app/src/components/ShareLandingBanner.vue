<template>
  <div v-if="!authenticated" class="share-banner">
    <p>
      HEY! this is jam buds, a site that lets you share music with your pals!
    </p>
    <p>
      <slot />
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  computed: {
    ...mapState({
      authenticated: (state) => state.auth.authenticated,
    }),
  },
};
</script>

<style lang="scss" scoped>
.share-banner {
  font-size: 18px;
  line-height: 24px;
  border: 1px var(--theme-text-color) solid;
  color: var(--theme-text-color);
  box-shadow: 5px 5px 0px var(--theme-text-color);
  padding: 20px 10px;
  border-radius: 4px;
  margin-bottom: 30px;
  text-align: center;
}

p:last-child {
  margin-bottom: 0px;
}
</style>
