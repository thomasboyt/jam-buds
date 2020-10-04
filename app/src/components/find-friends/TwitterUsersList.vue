<template>
  <ul>
    <li v-for="user of users" :key="user.id">
      <img :src="user.twitterAvatar" />

      <div class="body">
        <div>
          <span class="name">
            <nuxt-link :to="`/users/${user.profile.name}`">
              <template>{{ user.profile.name }}</template>
            </nuxt-link>
          </span>
          @{{ user.twitterName }}
        </div>

        <div class="button-container">
          <follow-toggle :name="user.profile.name" />
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
import FollowToggle from '../FollowToggle.vue';

export default {
  components: { FollowToggle },

  props: ['users'],
};
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  margin-left: 0px;
  padding-left: 0px;

  display: flex;
  flex-wrap: wrap;
}

li {
  flex: 0 0 50%;

  display: flex;
  height: 100px;
  margin-bottom: 20px;
}

img {
  flex: 0 0 auto;
  height: 100%;
}

.body {
  padding: 10px;
}

.name {
  font-size: 1.25em;
  font-weight: bold;
}

.button-container {
  margin-top: 10px;
}
</style>
