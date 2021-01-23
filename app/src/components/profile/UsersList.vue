<template>
  <ul>
    <li v-for="user of users" :key="user.id">
      <nuxt-link :to="`/users/${user.name}`">
        {{ user.name }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script>
export default {
  props: ['users'],
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

ul li a {
  display: block;
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
  margin-bottom: 4px;
  text-decoration: none;

  @media (min-width: $breakpoint-small) {
    font-size: 16px;
    margin-bottom: 8px;
  }
}
</style>
