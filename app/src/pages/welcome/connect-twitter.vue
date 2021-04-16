<template>
  <div data-test="connect-twitter">
    <welcome-step-panel>
      <h3>
        connect to twitter
        <small>(optional!)</small>
      </h3>

      <template v-if="twitterName">
        <p>
          you've connected your twitter account
          <strong>@{{ twitterName }}</strong
          >!
        </p>

        <div class="lower">
          <jb-button tag="nuxt-link" :to="nextPage" @click.native="setTab">
            continue
          </jb-button>
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
            <nuxt-link :to="nextPage" @click.native="setTab"
              >continue without connecting</nuxt-link
            >
          </p>
        </div>
      </template>
    </welcome-step-panel>
  </div>
</template>

<script>
import TwitterConnectButton from '~/components/settings/TwitterConnectButton.vue';
import JbButton from '~/components/lib/JbButton.vue';
import WelcomeStepPanel from '~/components/WelcomeStepPanel';

export default {
  components: { TwitterConnectButton, JbButton, WelcomeStepPanel },

  data() {
    return {
      nextPage: '/',
    };
  },

  computed: {
    twitterName() {
      return this.$accessor.currentUser.user.twitterName;
    },
  },

  methods: {
    setTab() {
      this.$store.commit('setActiveTab', '/');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
a {
  color: black;
}

h3 {
  font-size: $text-lg;
  line-height: $leading-none;
  margin-bottom: $spacing-lg;
  font-weight: normal;
}

.lower {
  margin-top: $spacing-2xl;
}
</style>
