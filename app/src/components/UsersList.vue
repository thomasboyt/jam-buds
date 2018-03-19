<template>
  <ul>
    <li v-for="user of users" :key="user.id">
      <router-link :to="`/users/${user.twitterName}`">
        {{user.twitterName}}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  props: ['users'],
};
</script>
