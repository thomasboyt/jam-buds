<template>
  <div class="logged-out-home" :style="{ background: gradient }">
    <logged-out-header :show-mobile="true" />
    <div class="logged-out-main">
      <div class="drawing desktop">
        <img :src="corgi" />
      </div>

      <div class="content">
        <sign-in-flow>
          <template #initial-copy>
            <div class="drawing mobile">
              <img :src="corgi" />
            </div>

            <h2>music sounds better with friends</h2>

            <p>
              no algorithms, no payola playlists. just what you and your friends
              are listening to. optionally connect spotify or apple music for
              seamless playback.
            </p>
          </template>
        </sign-in-flow>
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
import LoggedOutHeader from './LoggedOutHeader.vue';
import corgi from '~/assets/ghettoblaster_corgi.png';
import getGradient from '../util/gradients';
import SignInFlow from './sign-in-flow/SignInFlow.vue';

export default {
  components: { LoggedOutHeader, SignInFlow },

  data() {
    return {
      corgi,
      gradient: getGradient('jam buds'),
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
    max-width: 460px;
  }
}

.drawing {
  margin: 0 auto;
  text-align: center;

  transform: rotate(10deg);
  margin-bottom: 30px;

  &.desktop {
    flex: 0 1 auto;
    transform: rotate(-10deg);
    margin: 0;

    img {
      max-height: unset;
      border-width: 15px;
    }

    display: none;
    @media (min-width: $breakpoint-small) {
      display: block;
    }
  }

  &.mobile {
    display: block;
    @media (min-width: $breakpoint-small) {
      display: none;
    }
  }

  img {
    max-height: 250px;
    max-width: 100%;
    height: auto;
    border: 5px hotpink solid;
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

p {
  font-size: 16px;
  line-height: 20px;
  margin-bottom: 36px;
  @media (min-width: $breakpoint-small) {
    font-size: 18px;
    line-height: 24px;
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
