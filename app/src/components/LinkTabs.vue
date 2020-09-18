<template>
  <ul class="link-tabs">
    <li v-for="link of links" :key="link.to">
      <nuxt-link :to="`${linkPrefix || ''}${link.to}`" replace>{{
        link.label
      }}</nuxt-link>
    </li>
  </ul>
</template>

<script>
export default {
  props: ['linkPrefix', 'links'],
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.link-tabs {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px rgba(0, 0, 0, 0.4) solid;

  font-size: 18px;

  li {
    flex: 1 1 auto;
    text-align: center;

    a {
      text-decoration: none;
      display: block;
      border-bottom: 4px transparent solid;
      padding: 5px;

      &.nuxt-link-exact-active {
        font-weight: 600;
        border-bottom-color: $black;
      }
    }
  }

  @media (max-width: $breakpoint-small) {
    font-size: 16px;
  }
}
</style>
