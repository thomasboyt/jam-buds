<template>
  <div>
    <div class="connect-page connect-twitter">
      <h3>connect to twitter <small>(optional!)</small></h3>

      <template v-if="twitterName">
        <p>
          you've connected your twitter account
          <strong>@{{ twitterName }}</strong
          >!
        </p>

        <div class="lower">
          <settings-button tag="nuxt-link" :to="nextPage"
            >continue</settings-button
          >
        </div>
      </template>

      <template v-else>
        <p>
          connecting to twitter helps you find your friends! by connecting, you
          can see folks you follow who are on jam buds, and let folks who follow
          you find you. you can also cross-post to twitter when posting a song
        </p>

        <twitter-connect-button redirect="/welcome/connect-twitter" />

        <div class="lower">
          <p>
            <nuxt-link :to="nextPage"> continue without connecting </nuxt-link>
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import TwitterConnectButton from '../../components/settings/TwitterConnectButton.vue';
import SettingsButton from '../../components/settings/SettingsButton.vue';

export default {
  components: { TwitterConnectButton, SettingsButton },

  data() {
    return {
      nextPage: '/',
    };
  },

  computed: mapState({
    twitterName: (state) => state.currentUser.twitterName,
  }),
};
</script>

<style lang="scss" scoped>
.connect-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;
}

a {
  color: black;
}

h3 {
  font-size: 32px;
  line-height: 1em;
  margin-bottom: 24px;
  font-weight: normal;
}

.lower {
  margin-top: 50px;
}
</style>
