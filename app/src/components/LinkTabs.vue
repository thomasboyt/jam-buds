<template>
  <div class="link-tabs">
    <span v-for="(link, idx) of links" :key="link.to">
      <nuxt-link :to="`${linkPrefix || ''}${link.to}`">{{
        link.label
      }}</nuxt-link>
      <span v-if="idx !== links.length - 1">/&nbsp;</span>
    </span>
  </div>
</template>

<script>
export default {
  props: ['linkPrefix', 'links'],
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.link-tabs {
  font-size: 18px;

  @media (max-width: $breakpoint-small) {
    font-size: 16px;
  }
}

.link-tabs a.nuxt-link-exact-active {
  font-weight: 600;
}
</style:>