<template>
  <jb-button tag="a" :href="twitterConnectLink">connect to twitter</jb-button>
</template>

<script>
import JbButton from '../lib/JbButton.vue';

export default {
  components: { JbButton },

  props: ['redirect'],

  computed: {
    twitterConnectLink() {
      return `/auth/twitter-connect?redirect=${this.redirect}`;
    },
  },

  mounted() {
    const error = this.$route.query.twitterAuthError;
    if (error) {
      // remove error from path to prevent re-triggering
      this.$router.replace(this.$route.path);

      if (error === 'alreadyUsed') {
        this.$store.commit(
          'showErrorModal',
          'Error connecting Twitter: This Twitter account is already associated with a Jam Buds user! Email us at hello@jambuds.club if you need help accessing your existing account.'
        );
      } else {
        this.$store.commit(
          'showErrorModal',
          `Unknown error connecting Twitter: ${error}`
        );
      }
    }
  },
};
</script>
