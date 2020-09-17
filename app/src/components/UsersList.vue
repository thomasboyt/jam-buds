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
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
