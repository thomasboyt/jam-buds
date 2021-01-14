<template>
  <div class="logged-out-home" :style="{ background: gradient }">
    <logged-out-header :show-mobile="true" />
    <div class="logged-out-main">
      <div class="drawing">
        <img :src="corgi" />
      </div>

      <div class="content">
        <div v-if="sentMailAddress">
          <h2>check ur mail!</h2>
          <p>
            Check your inbox at
            <strong>{{ sentMailAddress }}</strong>
            for a link to sign in or sign up.
          </p>
          <p class="email-note">
            please allow up to 15 minutes for the email to arrive. due to
            strange forces of computers outside of our control, sometimes our
            emails may go to your "spam" folder, or, in Gmail, the "Promotions"
            tab.
          </p>
        </div>

        <div v-else>
          <h2>music sounds better with friends</h2>

          <p>
            no algorithms, no payola playlists. just what you and your friends
            are listening to. optionally connect spotify or apple music for
            seamless playback.
          </p>

          <p>
            want to get started?
            <strong>sign up or log in below:</strong>
          </p>

          <sign-in-form @sentMail="handleSentMail" />

          <p class="email-note">
            (fyi: your email stays with us, and will only be used for
            authentication unless you opt-in to other emails, like our
            infrequently-published newsletter)
          </p>
        </div>
      </div>
    </div>

    <footer>
      <span class="credits">
        site by
        <a href="https://jambuds.club/users/thomas">thomas</a>
        &middot;
      </span>
      <nuxt-link to="/about">about jam buds</nuxt-link> &middot;
      <a href="mailto:hello@jambuds.club">hello@jambuds.club</a>
    </footer>
  </div>
</template>

<script>
import SignInForm from './SignInForm.vue';
import LoggedOutHeader from './LoggedOutHeader.vue';
import corgi from '~/assets/ghettoblaster_corgi.png';
import getGradient from '../util/gradients';

export default {
  components: { SignInForm, LoggedOutHeader },

  data() {
    return {
      corgi,
      gradient: getGradient('jam buds'),
      sentMailAddress: null,
    };
  },

  mounted() {
    if ('sign-in-error' in this.$route.query) {
      this.$store.commit(
        'showErrorModal',
        'Invalid or expired sign-in token used. Please try requesting a new sign-in email.'
      );
      this.$router.replace(this.$route.path);
    }
  },

  methods: {
    handleSentMail(emailAddress) {
      this.sentMailAddress = emailAddress;
    },
  },
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.logged-out-home {
  background-attachment: fixed;
  display: flex;
  flex: 1;
  flex-flow: column;
  padding: 20px 20px;
}

.logged-out-main {
  flex: 1;
}

// Desktop two-column layout
@media (min-width: $breakpoint-small) {
  .logged-out-main {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    flex: 1 1 auto;
    margin-left: 70px;
    max-width: 400px;
  }
}

.drawing {
  margin: 0 auto;
  text-align: center;

  transform: rotate(10deg);
  margin-bottom: 30px;
  @media (min-width: $breakpoint-small) {
    flex: 0 1 auto;
    transform: rotate(-10deg);
    margin: 0;
  }

  img {
    max-height: 250px;
    max-width: 100%;
    height: auto;
    border: 5px hotpink solid;

    @media (min-width: $breakpoint-small) {
      max-height: unset;
      border-width: 15px;
    }
  }
}

h2 {
  line-height: 1em;
  margin-top: 0px;
  margin-bottom: 20px;
  font-size: 48px;

  @media (max-width: $breakpoint-small) {
    font-size: 30px;
    text-align: center;
  }
}

.email-note {
  font-size: 12px;
  margin-top: 12px;
}

footer {
  font-size: 14px;
  text-align: center;

  a,
  a:visited,
  a:hover,
  a:active {
    color: black;
    font-weight: 500;
  }

  .credits {
    @media (max-width: $breakpoint-small) {
      display: none;
    }
  }
}
</style>
