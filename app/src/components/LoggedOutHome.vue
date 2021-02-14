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
            <sign-in-header>music sounds better with friends</sign-in-header>

            <div class="drawing mobile">
              <img :src="corgi" />
            </div>

            <p class="tagline">
              no algorithms, no influencer-curated playlists. just what you and
              your friends are listening to. optionally connect spotify or apple
              music for seamless playback.
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
import SignInHeader from './sign-in-flow/SignInHeader.vue';

export default {
  components: { LoggedOutHeader, SignInFlow, SignInHeader },

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
  padding: $spacing-md;
}

.logged-out-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  flex: 1 1 auto;
}

// Desktop two-column layout
@media (min-width: $breakpoint-small) {
  .logged-out-home {
    padding-top: $spacing-pg-top-desktop;
  }

  .content {
    flex: 1 1 auto;
    margin-left: $spacing-4xl;
    max-width: 460px;
  }
}

.drawing {
  margin: 0 auto;
  margin-bottom: $spacing-2xl;

  &.desktop {
    flex: 0 1 auto;
    margin: 0;

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
    margin: 0 auto;
    transform: rotate(-3deg);
  }

  &.desktop img {
    transform: rotate(-10deg);
    max-height: unset;
    border-width: 15px;
  }
}

.tagline {
  font-size: $text-base;
  line-height: $leading-normal;
  margin-top: $spacing-lg;
  margin-bottom: $spacing-2xl;
  display: none;

  @media (min-width: $breakpoint-small) {
    margin-top: 0;
    font-size: $text-md;
    display: block;
  }
}

footer {
  font-size: $text-sm;
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
