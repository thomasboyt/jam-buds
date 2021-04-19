<template>
  <ul>
    <li v-for="user of users" :key="user.twitterName">
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

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ApiSchema } from '~/api/_helpers';
import FollowToggle from '../FollowToggle.vue';

export default Vue.extend({
  components: { FollowToggle },

  props: {
    users: {
      type: Object as PropType<ApiSchema<'TwitterFriendSuggestion'>[]>,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
ul {
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
